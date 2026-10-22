<?php
/**
 * Plugin Name:       Sawa Testimonials
 * Description:       A wall of student testimonials plus a review form where students send written, voice or video reviews. Shortcodes: [sawa_testimonials] and [sawa_review_form].
 * Version:           1.9.1
 * Author:            Sawa English
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * License:           GPL-2.0-or-later
 * Text Domain:       sawa-testimonials
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SAWA_T_VER', '1.9.1' );
define( 'SAWA_T_URL', plugin_dir_url( __FILE__ ) );
define( 'SAWA_T_DIR', plugin_dir_path( __FILE__ ) );

final class Sawa_Testimonials {

	const PT  = 'sawa_testimonial';
	const OPT = 'sawa_t_settings';

	const SOURCES = array( 'Skool', 'Facebook', 'YouTube', 'Instagram', 'WhatsApp', 'Telegram', 'Discord', 'X', 'LinkedIn', 'TikTok', 'Google', 'Trustpilot', 'Loom', 'Email', 'Website', 'Other' );
	const TYPES   = array(
		'text'  => 'Written',
		'image' => 'Screenshot',
		'video' => 'Video',
		'audio' => 'Voice message',
	);
	const FONTS   = array( 'inherit', 'Cairo', 'Tajawal', 'IBM Plex Sans Arabic', 'DM Sans', 'Figtree', 'Nunito', 'Poppins', 'Lora' );

	public static function init() {
		add_action( 'init', array( __CLASS__, 'register' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'rest' ) );
		add_shortcode( 'sawa_testimonials', array( __CLASS__, 'shortcode_wall' ) );
		add_shortcode( 'sawa_review_form', array( __CLASS__, 'shortcode_form' ) );
		require_once SAWA_T_DIR . 'includes/gift.php';
		Sawa_Testimonials_Gift::init();
		require_once SAWA_T_DIR . 'includes/transcript.php';
		Sawa_Testimonials_Transcript::init();
		if ( is_admin() ) {
			require_once SAWA_T_DIR . 'includes/admin.php';
			Sawa_Testimonials_Admin::init();
		}
	}

	/* ------------------------------------------------------------------ settings */

	public static function defaults() {
		return array(
			'title'         => 'لسه مش متأكد؟',
			'subtitle'      => 'اسمع من الطلبة نفسهم.',
			'accent'        => '#0F0F10',
			'theme'         => 'light',
			'font'          => 'inherit',
			'radius'        => 16,
			'maxColumns'    => 3,
			'initialCount'  => 12,
			'moreLabel'     => 'اعرض تقييمات أكتر',
			'showSummary'   => 1,
			'showFilters'   => 1,
			'showRatings'   => 1,
			'showSources'   => 1,
			'showDates'     => 1,
			'formTitle'     => 'How did Sawa English help your English?',
			'formIntro'     => 'Tell us about before and after. Your story can help someone who is just starting.',
			'formConsent'   => "I don't mind if my review is used for marketing.",
			'formButton'    => 'Send my review',
			'formThanks'    => 'Thank you! Your review was sent.',
			'formExamples'  => 'Abdullah Ahmed, Ahmed Fawzy, Zeyad Ouf',
			'minWords'      => 40,
			'rejectSubject' => 'About your review for Sawa English',
			'rejectEmail'   => "Hi {name},\n\nThank you for sending a review to Sawa English. We could not publish it yet, because it is too short.\n\nPlease take the time to write a proper review and share your experience in depth:\n- How did you find the community?\n- How did it help your English?\n- What problems did you have before, and how do you deal with them now?\n- What new things did you learn?\n\nWrite your review again here:\n{review_link}\n\nWhen we publish your new review, your free access to the Sawa App will be ready too.\n\nSherif, Sawa English",
			'rejectAiSubject' => 'About your review for Sawa English',
			'rejectAiEmail'   => "Hi {name},\n\nThank you for sending a review to Sawa English. We could not publish it, because it looks like it was written with AI (like ChatGPT).\n\nWe want your real story, in your own words. Simple Arabic and short sentences are completely fine. A real story is what helps other students.\n\nPlease write your review again yourself, and answer these questions:\n- How did you find the community?\n- How did it help your English?\n- What problems did you have before, and how do you deal with them now?\n- What new things did you learn?\n\nWrite your review again here:\n{review_link}\n\nWhen we publish your new review, your free access to the Sawa App will be ready too.\n\nSherif, Sawa English",
			'notify'        => 1,
			'famewallWall'  => 'sherifabdelbaset',
		);
	}

	public static function settings() {
		$saved = get_option( self::OPT, array() );
		$saved = is_array( $saved ) ? $saved : array();
		// 1.1: the old English defaults become the Arabic ones unless they were changed.
		$old = array(
			'title'       => 'Still not sure?',
			'subtitle'    => 'Take a look at what others have said 👇',
			'moreLabel'   => 'Show more reviews',
			'formTitle'   => 'Share your experience with Sawa English',
			'formConsent' => 'Sawa English can show my review, name and photo on its website and social media.',
			'formButton'  => 'Send my review',
			'formThanks'  => 'Thank you! Your review was sent.',
			'accent'      => '#ae1e20',
		);
		foreach ( $old as $k => $v ) {
			if ( isset( $saved[ $k ] ) && $saved[ $k ] === $v ) {
				unset( $saved[ $k ] );
			}
		}
		// 1.3: the review form is English only, so any Arabic form text saved earlier falls back to the English defaults.
		foreach ( array( 'formTitle', 'formIntro', 'formConsent', 'formButton', 'formThanks' ) as $k ) {
			if ( isset( $saved[ $k ] ) && preg_match( '/\p{Arabic}/u', $saved[ $k ] ) ) {
				unset( $saved[ $k ] );
			}
		}
		if ( isset( $saved['formConsent'] ) && 0 === strpos( $saved['formConsent'], 'Sawa English can show my review' ) ) {
			unset( $saved['formConsent'] );
		}
		if ( isset( $saved['formIntro'] ) && 0 === strpos( $saved['formIntro'], 'How has learning with us helped you?' ) ) {
			unset( $saved['formIntro'] );
		}
		return wp_parse_args( $saved, self::defaults() );
	}

	public static function wall_settings() {
		$s    = self::settings();
		$keys = array( 'title', 'subtitle', 'accent', 'theme', 'font', 'radius', 'maxColumns', 'initialCount', 'moreLabel', 'showSummary', 'showFilters', 'showRatings', 'showSources', 'showDates' );
		$out  = array();
		foreach ( $keys as $k ) {
			$out[ $k ] = $s[ $k ];
		}
		foreach ( array( 'showSummary', 'showFilters', 'showRatings', 'showSources', 'showDates' ) as $k ) {
			$out[ $k ] = (bool) $out[ $k ];
		}
		return $out;
	}

	/* ------------------------------------------------------------------ data */

	public static function register() {
		register_post_type(
			self::PT,
			array(
				'labels'        => array(
					'name'               => 'Testimonials',
					'singular_name'      => 'Testimonial',
					'menu_name'          => 'Testimonials',
					'all_items'          => 'All testimonials',
					'add_new'            => 'Add testimonial',
					'add_new_item'       => 'Add testimonial',
					'edit_item'          => 'Edit testimonial',
					'new_item'           => 'New testimonial',
					'search_items'       => 'Search testimonials',
					'not_found'          => 'No testimonials found',
					'not_found_in_trash' => 'No testimonials in the trash',
				),
				'public'        => false,
				'show_ui'       => true,
				'show_in_menu'  => true,
				'show_in_rest'  => false,
				'menu_icon'     => 'dashicons-heart',
				'menu_position' => 25,
				'supports'      => array( 'title' ),
				'map_meta_cap'  => true,
			)
		);
	}

	public static function meta( $id, $key, $default = '' ) {
		$v = get_post_meta( $id, '_sawa_' . $key, true );
		return ( '' === $v || null === $v ) ? $default : $v;
	}

	/** One testimonial in the shape the wall script expects. */
	public static function item( $p ) {
		$no_name = (bool) self::meta( $p->ID, 'noname', 0 );
		$no_date = (bool) self::meta( $p->ID, 'nodate', 0 );
		return array(
			'type'     => self::meta( $p->ID, 'type', 'text' ),
			'name'     => $no_name ? '' : $p->post_title,
			'role'     => self::meta( $p->ID, 'role' ),
			'text'     => $p->post_content,
			'rating'   => (int) self::meta( $p->ID, 'rating', 0 ),
			'source'   => self::meta( $p->ID, 'source', 'Other' ),
			'link'     => self::meta( $p->ID, 'link' ),
			'date'     => $no_date ? '' : get_the_date( 'Y-m-d', $p ),
			'media'    => self::meta( $p->ID, 'media' ),
			'avatar'   => self::meta( $p->ID, 'avatar' ),
			'featured' => (bool) self::meta( $p->ID, 'featured', 0 ),
			'transcript' => 'done' === self::meta( $p->ID, 'transcript_status' ) ? self::meta( $p->ID, 'transcript' ) : '',
		);
	}

	public static function wall_items( $featured_only = false, $limit = 0 ) {
		$args = array(
			'post_type'      => self::PT,
			'post_status'    => 'publish',
			'posts_per_page' => $limit > 0 ? $limit : 1000,
			'orderby'        => 'date',
			'order'          => 'DESC',
			'no_found_rows'  => true,
		);
		if ( $featured_only ) {
			$args['meta_query'] = array(
				array(
					'key'   => '_sawa_featured',
					'value' => '1',
				),
			);
		}
		$q = new WP_Query( $args );
		return array_map( array( __CLASS__, 'item' ), $q->posts );
	}

	/* ------------------------------------------------------------------ shortcodes */

	private static function json_script( $class, $data ) {
		$json = wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
		return '<script type="application/json" class="' . esc_attr( $class ) . '">' . $json . '</script>';
	}

	/** [sawa_testimonials featured="yes" limit="12"] */
	public static function shortcode_wall( $atts ) {
		$a        = shortcode_atts(
			array(
				'featured' => '',
				'limit'    => 0,
				'heading'  => 'yes',
			),
			$atts
		);
		$featured = in_array( strtolower( (string) $a['featured'] ), array( '1', 'yes', 'true' ), true );
		wp_enqueue_script( 'sawa-wall', SAWA_T_URL . 'assets/wall.js', array(), SAWA_T_VER, true );
		$settings = self::wall_settings();
		if ( in_array( strtolower( (string) $a['heading'] ), array( 'no', '0', 'false' ), true ) ) {
			$settings['hideHeading'] = true;
		}
		$data = array(
			'settings' => $settings,
			'items'    => self::wall_items( $featured, (int) $a['limit'] ),
		);
		return '<div class="sawa-wall"></div>' . self::json_script( 'sawa-wall-data', $data );
	}

	public static function form_config( $preview = false ) {
		$s = self::settings();
		return array(
			'endpoint'  => esc_url_raw( rest_url( 'sawa/v1/submit' ) ),
			'maxUpload' => (int) wp_max_upload_size(),
			'accent'    => $s['accent'],
			'theme'     => $s['theme'],
			'font'      => $s['font'],
			'radius'    => (int) $s['radius'],
			'title'     => $s['formTitle'],
			'intro'     => $s['formIntro'],
			'consent'   => $s['formConsent'],
			'button'    => $s['formButton'],
			'thanks'    => $s['formThanks'],
			'preview'   => $preview,
			'examples'  => self::form_examples( $s['formExamples'] ),
			'minWords'  => (int) $s['minWords'],
		);
	}

	/** The newest published testimonial of each student named in the setting, shown on the form as example reviews. */
	public static function form_examples( $names ) {
		$out = array();
		foreach ( array_filter( array_map( 'trim', explode( ',', (string) $names ) ) ) as $name ) {
			$q = new WP_Query(
				array(
					'post_type'      => self::PT,
					'post_status'    => 'publish',
					'title'          => $name,
					'posts_per_page' => 1,
					'orderby'        => 'date',
					'order'          => 'DESC',
					'no_found_rows'  => true,
				)
			);
			if ( $q->posts ) {
				$p     = $q->posts[0];
				$out[] = array(
					'name'   => $p->post_title,
					'avatar' => self::meta( $p->ID, 'avatar' ),
					'text'   => $p->post_content,
				);
			}
		}
		return $out;
	}

	/** True when a text has at least as many Arabic letters as Latin ones (Arabic with some English words is fine). */
	public static function mostly_arabic( $text ) {
		$ar = preg_match_all( '/\p{Arabic}/u', $text );
		$en = preg_match_all( '/[A-Za-z]/', $text );
		return $ar > 0 && $ar >= $en;
	}

	/** [sawa_review_form] */
	public static function shortcode_form() {
		wp_enqueue_script( 'sawa-form', SAWA_T_URL . 'assets/form.js', array(), SAWA_T_VER, true );
		return '<div class="sawa-review-form"></div>' . self::json_script( 'sawa-form-data', self::form_config() );
	}

	/* ------------------------------------------------------------------ REST */

	public static function rest() {
		register_rest_route(
			'sawa/v1',
			'/submit',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'submit' ),
				'permission_callback' => '__return_true',
			)
		);
		register_rest_route(
			'sawa/v1',
			'/wall',
			array(
				'methods'             => 'GET',
				'callback'            => function () {
					return array(
						'settings' => self::wall_settings(),
						'items'    => self::wall_items(),
					);
				},
				'permission_callback' => '__return_true',
			)
		);
	}

	private static function client_ip() {
		foreach ( array( 'HTTP_CF_CONNECTING_IP', 'REMOTE_ADDR' ) as $k ) {
			if ( ! empty( $_SERVER[ $k ] ) ) {
				return sanitize_text_field( wp_unslash( $_SERVER[ $k ] ) );
			}
		}
		return '';
	}

	public static function submit( WP_REST_Request $r ) {
		$fail = function ( $message, $status = 400 ) {
			return new WP_REST_Response(
				array(
					'ok'      => false,
					'message' => $message,
				),
				$status
			);
		};

		// Bots: the hidden "website" field is filled in, or the form was sent within 2.5 seconds of opening.
		if ( '' !== trim( (string) $r->get_param( 'website' ) ) || (int) $r->get_param( 'elapsed' ) < 2500 ) {
			return new WP_REST_Response( array( 'ok' => true ), 200 );
		}

		$rl_key = 'sawa_t_rl_' . md5( self::client_ip() );
		$count  = (int) get_transient( $rl_key );
		if ( $count >= 6 ) {
			return $fail( 'You sent a few reviews already. Try again in one hour.', 429 );
		}

		$name   = sanitize_text_field( mb_substr( (string) $r->get_param( 'name' ), 0, 80 ) );
		$role   = sanitize_text_field( mb_substr( (string) $r->get_param( 'role' ), 0, 120 ) );
		$text   = sanitize_textarea_field( mb_substr( (string) $r->get_param( 'text' ), 0, 4000 ) );
		$kind   = in_array( $r->get_param( 'kind' ), array( 'text', 'audio', 'video' ), true ) ? $r->get_param( 'kind' ) : 'text';
		$rating = max( 0, min( 5, (int) $r->get_param( 'rating' ) ) );
		$vurl   = esc_url_raw( trim( (string) $r->get_param( 'video_url' ) ) );
		$skool  = sanitize_text_field( mb_substr( (string) $r->get_param( 'skool' ), 0, 80 ) );
		$email  = sanitize_email( (string) $r->get_param( 'email' ) );
		$files  = $r->get_file_params();

		if ( ! $r->get_param( 'consent' ) ) {
			return $fail( 'Tick the box so we can use your review.' );
		}
		if ( '' === $name ) {
			return $fail( 'Write your name.' );
		}
		if ( '' === $role ) {
			return $fail( 'Write your job or what you study.' );
		}
		if ( '' === $skool ) {
			return $fail( 'Write your name on Skool.' );
		}
		if ( ! is_email( $email ) ) {
			return $fail( 'Write a correct email.' );
		}
		if ( empty( $files['photo'] ) ) {
			return $fail( 'Add a photo of yourself.' );
		}
		$min   = max( 1, (int) self::settings()['minWords'] );
		$words = count( preg_split( '/\s+/u', trim( $text ), -1, PREG_SPLIT_NO_EMPTY ) );
		if ( 'text' === $kind && $words < $min ) {
			return $fail( sprintf( 'Write at least %d words. You have %d.', $min, $words ) );
		}
		if ( $rating < 1 ) {
			return $fail( 'Choose your rating (1 to 5 stars).' );
		}
		if ( 'text' === $kind && ! self::mostly_arabic( $text ) ) {
			return $fail( 'Write your review in Arabic.' );
		}
		if ( 'audio' === $kind && empty( $files['audio'] ) ) {
			return $fail( 'Record your voice message first.' );
		}
		if ( 'video' === $kind && empty( $files['video'] ) && ! $vurl ) {
			return $fail( 'Upload a video, or paste a YouTube or Loom link.' );
		}
		if ( $vurl && ! preg_match( '~^https?://([a-z0-9-]+\.)*(youtube\.com|youtu\.be|loom\.com)/~i', $vurl ) ) {
			return $fail( 'The link must be from YouTube or Loom.' );
		}

		$id = wp_insert_post(
			array(
				'post_type'    => self::PT,
				'post_status'  => 'pending',
				'post_title'   => $name,
				'post_content' => $text,
			),
			true
		);
		if ( is_wp_error( $id ) ) {
			return $fail( 'Your review was not saved. Try again.', 500 );
		}
		update_post_meta( $id, '_sawa_type', $kind );
		update_post_meta( $id, '_sawa_role', $role );
		update_post_meta( $id, '_sawa_rating', $rating );
		update_post_meta( $id, '_sawa_source', 'Website' );
		update_post_meta( $id, '_sawa_submitted', 1 );
		update_post_meta( $id, '_sawa_skool', $skool );
		update_post_meta( $id, '_sawa_email', $email );
		if ( 'video' === $kind && $vurl && empty( $files['video'] ) ) {
			update_post_meta( $id, '_sawa_media', $vurl );
		}

		$uploads = array(
			'audio' => array( 'audio/', 'video/webm', 'video/mp4', 'application/octet-stream' ),
			'video' => array( 'video/', 'application/octet-stream' ),
			'photo' => array( 'image/' ),
		);
		foreach ( $uploads as $field => $allowed ) {
			if ( empty( $files[ $field ] ) || ( 'audio' === $field && 'audio' !== $kind ) || ( 'video' === $field && 'video' !== $kind ) ) {
				continue;
			}
			$url = self::store_upload( $field, $allowed, $id );
			if ( is_wp_error( $url ) ) {
				wp_delete_post( $id, true );
				return $fail( $url->get_error_message() );
			}
			update_post_meta( $id, 'photo' === $field ? '_sawa_avatar' : '_sawa_media', $url );
		}

		set_transient( $rl_key, $count + 1, HOUR_IN_SECONDS );
		Sawa_Testimonials_Transcript::schedule( $id );

		if ( self::settings()['notify'] ) {
			$type_label = strtolower( self::TYPES[ $kind ] );
			wp_mail(
				get_option( 'admin_email' ),
				sprintf( 'New %s review from %s', $type_label, $name ),
				sprintf(
					"%s sent a new %s review.\n\n%s\n\nName on Skool: %s\nEmail: %s\n\nApprove or reject it here:\n%s",
					$name,
					$type_label,
					$text ? '"' . $text . '"' : '',
					$skool,
					$email,
					admin_url( 'edit.php?post_type=' . self::PT . '&page=sawa-t-queue' )
				)
			);
		}

		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}

	/** Saves one uploaded file into the media library and returns its URL. */
	private static function store_upload( $field, $allowed, $post_id ) {
		$f = $_FILES[ $field ]; // phpcs:ignore WordPress.Security.NonceVerification -- public form, validated below.
		if ( ! empty( $f['error'] ) ) {
			if ( in_array( (int) $f['error'], array( UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE ), true ) ) {
				return new WP_Error( 'size', 'This file is too big for the website. Put the video on YouTube or Loom and paste the link.' );
			}
			return new WP_Error( 'upload', 'The file did not upload. Try again.' );
		}
		$type = isset( $f['type'] ) ? (string) $f['type'] : '';
		$ok   = false;
		foreach ( $allowed as $prefix ) {
			if ( 0 === strpos( $type, $prefix ) ) {
				$ok = true;
			}
		}
		if ( ! $ok ) {
			return new WP_Error( 'type', 'This type of file is not allowed here.' );
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		add_filter( 'upload_mimes', array( __CLASS__, 'extra_mimes' ) );
		add_filter( 'wp_check_filetype_and_ext', array( __CLASS__, 'allow_recordings' ), 10, 5 );
		$aid = media_handle_upload( $field, $post_id, array(), array( 'test_form' => false ) );
		remove_filter( 'upload_mimes', array( __CLASS__, 'extra_mimes' ) );
		remove_filter( 'wp_check_filetype_and_ext', array( __CLASS__, 'allow_recordings' ), 10 );
		if ( is_wp_error( $aid ) ) {
			return new WP_Error( 'upload', 'The file was not saved: ' . $aid->get_error_message() );
		}
		return wp_get_attachment_url( $aid );
	}

	public static function extra_mimes( $mimes ) {
		$mimes['weba'] = 'audio/webm';
		$mimes['webm'] = 'video/webm';
		$mimes['m4a']  = 'audio/mp4';
		$mimes['ogg']  = 'audio/ogg';
		$mimes['mov']  = 'video/quicktime';
		$mimes['m4v']  = 'video/mp4';
		return $mimes;
	}

	/** Browsers label voice recordings audio/webm while the .webm extension maps to video/webm; accept both. */
	public static function allow_recordings( $data, $file, $filename, $mimes, $real_mime = null ) {
		if ( ! empty( $data['ext'] ) && ! empty( $data['type'] ) ) {
			return $data;
		}
		$ft = wp_check_filetype( $filename, $mimes );
		if ( $ft['ext'] && preg_match( '~^(audio|video)/~', (string) $ft['type'] ) && ( ! $real_mime || preg_match( '~^(audio|video)/|^application/octet-stream~', (string) $real_mime ) ) ) {
			return array(
				'ext'             => $ft['ext'],
				'type'            => $ft['type'],
				'proper_filename' => false,
			);
		}
		return $data;
	}

	/* ------------------------------------------------------------------ Famewall import */

	public static function yt_id( $u ) {
		return preg_match( '~(?:youtu\.be/|[?&]v=|/embed/|/shorts/|/live/)([\w-]{11})~', (string) $u, $m ) ? $m[1] : '';
	}

	public static function loom_id( $u ) {
		return preg_match( '~loom\.com/(?:share|embed)/([a-f0-9]{32})~i', (string) $u, $m ) ? $m[1] : '';
	}

	private static function fix_url( $u ) {
		return $u ? str_replace( ' ', '%20', trim( (string) $u ) ) : '';
	}

	public static function html_to_text( $h ) {
		if ( ! $h ) {
			return '';
		}
		$s = str_replace( "\r", '', (string) $h );
		$s = preg_replace( '~<br\s*/?>~i', "\n", $s );
		$s = preg_replace( '~</(div|p|li)>~i', "\n", $s );
		$s = preg_replace( '~<li[^>]*>~i', '• ', $s );
		$s = preg_replace( '~</?(b|strong)\b[^>]*>~i', '**', $s );
		$s = wp_strip_all_tags( $s, false );
		$s = html_entity_decode( $s, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$s = preg_replace( '~\*\*(\s*)\*\*~u', '$1', $s );
		$s = preg_replace( "~[ \t]+\n~", "\n", $s );
		$s = preg_replace( "~\n{3,}~", "\n\n", $s );
		return trim( $s );
	}

	private static function fw_convert( $r ) {
		$map  = array(
			41 => 'Skool',
			14 => 'Facebook',
			20 => 'YouTube',
			19 => 'Discord',
			9  => 'Loom',
		);
		$ct   = (int) ( $r['social_card_type'] ?? 0 );
		$vid  = (string) ( $r['video_embed_url'] ?? '' );
		$pb   = (string) ( $r['video_playback_id'] ?? '' );
		$link = (string) ( $r['message_link'] ?? '' );
		$type = 'text';
		$media = '';
		if ( $vid || $pb || 9 === $ct ) {
			$l = self::loom_id( $vid ) ? self::loom_id( $vid ) : self::loom_id( $link );
			$y = self::yt_id( $vid ) ? self::yt_id( $vid ) : self::yt_id( $link );
			if ( $l ) {
				$media = 'https://www.loom.com/share/' . $l;
			} elseif ( $y ) {
				$media = 'https://www.youtube.com/watch?v=' . $y;
			} elseif ( $pb ) {
				$media = 'https://stream.mux.com/' . $pb;
			}
			if ( $media ) {
				$type = 'video';
			}
		} elseif ( ! empty( $r['screenshot_image'] ) ) {
			$type  = 'image';
			$media = self::fix_url( $r['screenshot_image'] );
		} elseif ( ! empty( $r['message_media_image'] ) ) {
			$media = self::fix_url( $r['message_media_image'] );
		}
		$source = $map[ $ct ] ?? 'Other';
		if ( 'video' === $type ) {
			$source = self::loom_id( $media ) ? 'Loom' : ( self::yt_id( $media ) ? 'YouTube' : 'Other' );
		}
		$text = self::html_to_text( $r['message_content'] ?? '' );
		if ( '' === $text && '' === $media ) {
			return null;
		}
		$name = trim( (string) ( $r['author_name'] ?? '' ) );
		if ( preg_match( '/^loom video$/i', $name ) ) {
			$name = '';
		}
		return array(
			'type'   => $type,
			'name'   => $name,
			'role'   => trim( (string) ( $r['work_title'] ?? '' ) ),
			'text'   => $text,
			'rating' => (int) ( $r['star_rating'] ?? 0 ),
			'source' => $source,
			'link'   => preg_match( '~^https?://~', $link ) ? self::fix_url( $link ) : '',
			'time'   => (string) ( $r['message_time'] ?? '' ),
			'media'  => $media,
			'avatar' => self::fix_url( $r['author_image'] ?? '' ),
			'fw_id'  => (string) $r['uuid'],
		);
	}

	/** Adds every testimonial on a public Famewall wall that isn't here yet. */
	public static function import_famewall( $wall ) {
		$res = wp_remote_get( 'https://embed.famewall.io/api/seo-embed?wall_url=' . rawurlencode( $wall ) . '&user_language=en-US', array( 'timeout' => 30 ) );
		if ( is_wp_error( $res ) ) {
			return $res;
		}
		$j = json_decode( wp_remote_retrieve_body( $res ), true );
		if ( empty( $j['results'] ) || ! is_array( $j['results'] ) ) {
			return new WP_Error( 'famewall', sprintf( 'Famewall did not return a wall called "%s".', $wall ) );
		}
		global $wpdb;
		$have  = $wpdb->get_col( "SELECT meta_value FROM {$wpdb->postmeta} WHERE meta_key = '_sawa_fw_id'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$added = 0;
		foreach ( $j['results'] as $r ) {
			if ( empty( $r['uuid'] ) || in_array( (string) $r['uuid'], $have, true ) ) {
				continue;
			}
			$c = self::fw_convert( $r );
			if ( ! $c ) {
				continue;
			}
			$ts      = $c['time'] ? strtotime( $c['time'] ) : false;
			$gmt     = $ts ? gmdate( 'Y-m-d H:i:s', $ts ) : '2024-01-01 12:00:00';
			$post_id = wp_insert_post(
				array(
					'post_type'     => self::PT,
					'post_status'   => 'publish',
					'post_title'    => '' !== $c['name'] ? $c['name'] : ( 'video' === $c['type'] ? 'Video testimonial' : 'Screenshot testimonial' ),
					'post_content'  => $c['text'],
					'post_date'     => get_date_from_gmt( $gmt ),
					'post_date_gmt' => $gmt,
				),
				true
			);
			if ( is_wp_error( $post_id ) ) {
				continue;
			}
			foreach ( array( 'type', 'role', 'rating', 'source', 'link', 'media', 'avatar', 'fw_id' ) as $k ) {
				update_post_meta( $post_id, '_sawa_' . $k, $c[ $k ] );
			}
			if ( '' === $c['name'] ) {
				update_post_meta( $post_id, '_sawa_noname', 1 );
			}
			if ( ! $ts ) {
				update_post_meta( $post_id, '_sawa_nodate', 1 );
			}
			++$added;
		}
		return array(
			'added' => $added,
			'total' => count( $j['results'] ),
		);
	}
}

Sawa_Testimonials::init();
