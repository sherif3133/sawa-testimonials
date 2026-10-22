<?php
/**
 * Transcripts of voice and video reviews: what the student said, as Arabic text.
 * Uses the OpenAI speech-to-text key saved in Sawa Lens (Settings → Language Lens). A new review is transcribed
 * in the background a moment after it's sent (WP-Cron), so the student never waits. The Review queue shows the
 * text, can run it again and lets Sherif fix words; approved reviews show it on the wall behind a toggle.
 *
 * Meta: _sawa_transcript (text), _sawa_transcript_status (waiting | done | link | type | big | off | error).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Sawa_Testimonials_Transcript {

	const HOOK   = 'sawa_t_transcribe';
	const MAX_MB = 25; // OpenAI's limit
	const TYPES  = array( 'flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'wav', 'webm' ); // what OpenAI accepts
	const PROMPT = 'A student of Sawa English, an English school for Arabic speakers run by Sherif, talks about their experience. They speak mostly Arabic (often Egyptian), with some English words. Write exactly what they say in Arabic script and keep English words in English letters. Do not translate, correct or summarise.';

	public static function init() {
		add_action( self::HOOK, array( __CLASS__, 'run' ) );
	}

	/** Speech-to-text is set up in Sawa Lens. */
	public static function available() {
		return class_exists( 'Sawa_Lens_AI' ) && '' !== (string) Sawa_Lens_AI::settings()['stt_key'];
	}

	public static function status( $id ) {
		return (string) get_post_meta( $id, '_sawa_transcript_status', true );
	}

	public static function text( $id ) {
		return (string) get_post_meta( $id, '_sawa_transcript', true );
	}

	/** Queues a transcript for a new voice or video review. */
	public static function schedule( $id ) {
		if ( ! in_array( get_post_meta( $id, '_sawa_type', true ), array( 'audio', 'video' ), true ) ) {
			return;
		}
		update_post_meta( $id, '_sawa_transcript_status', 'waiting' );
		wp_schedule_single_event( time(), self::HOOK, array( (int) $id ) );
		spawn_cron();
	}

	/** The uploaded file on this server, or '' for YouTube/Loom links. */
	private static function file( $id ) {
		$url = (string) get_post_meta( $id, '_sawa_media', true );
		$aid = $url ? attachment_url_to_postid( $url ) : 0;
		$f   = $aid ? get_attached_file( $aid ) : '';
		return $f && is_readable( $f ) ? $f : '';
	}

	/** Transcribes one review now. Saves the text and a status, and returns the status. */
	public static function run( $id ) {
		$id   = (int) $id;
		$set  = function ( $status, $text = null ) use ( $id ) {
			update_post_meta( $id, '_sawa_transcript_status', $status );
			if ( null !== $text ) {
				update_post_meta( $id, '_sawa_transcript', $text );
			}
			return $status;
		};
		if ( ! get_post( $id ) ) {
			return 'error';
		}
		if ( ! self::available() ) {
			return $set( 'off' );
		}
		$file = self::file( $id );
		if ( '' === $file ) {
			return $set( 'link' );
		}
		if ( ! in_array( strtolower( pathinfo( $file, PATHINFO_EXTENSION ) ), self::TYPES, true ) ) {
			return $set( 'type' );
		}
		if ( filesize( $file ) > self::MAX_MB * MB_IN_BYTES ) {
			return $set( 'big' );
		}
		$text = Sawa_Lens_AI::transcribe( 0, $file, self::PROMPT, self::MAX_MB );
		if ( is_wp_error( $text ) ) {
			update_post_meta( $id, '_sawa_transcript_error', $text->get_error_message() . ' ' . get_option( 'sawa_lens_last_ai_error', '' ) );
			return $set( 'error' );
		}
		return $set( 'done', sanitize_textarea_field( $text ) );
	}

	/** What the Review queue says when there is no transcript text. */
	public static function note( $id ) {
		$notes = array(
			'waiting' => 'Writing out what they said. Refresh in a minute.',
			'link'    => 'No transcript: YouTube and Loom links can\'t be transcribed, only files sent through the form.',
			'type'    => 'No transcript: this file type can\'t be transcribed (for example .mov from an iPhone).',
			'big'     => 'No transcript: the file is bigger than 25 MB.',
			'off'     => 'Transcripts are off. Add the OpenAI speech-to-text key in Settings → Language Lens.',
			'error'   => 'The transcript didn\'t work this time.',
		);
		$s = self::status( $id );
		if ( '' === $s ) {
			return self::available() ? 'No transcript yet.' : $notes['off'];
		}
		return $notes[ $s ] ?? '';
	}
}
