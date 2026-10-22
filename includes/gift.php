<?php
/**
 * The gift for sending a review: free access to the Sawa App.
 * After a review is sent, the form sends the student to the page with [sawa_gift_form] with a one-time code.
 * The student writes their full name, Skool name and email. That creates a pending Sawa Tracker request.
 * When Sherif approves it, the student gets an English email with a link to make a password and open the app.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Sawa_Testimonials_Gift {

	const CODE_TTL = 2 * DAY_IN_SECONDS;

	public static function init() {
		add_shortcode( 'sawa_gift_form', array( __CLASS__, 'shortcode' ) );
		add_action( 'rest_api_init', array( __CLASS__, 'rest' ) );
		add_action( 'added_user_meta', array( __CLASS__, 'status_changed' ), 10, 4 );
		add_action( 'updated_user_meta', array( __CLASS__, 'status_changed' ), 10, 4 );
		add_filter( 'sawa_tracker_welcome_email', array( __CLASS__, 'skip_tracker_welcome' ), 10, 2 );
		add_action( 'save_post_page', array( __CLASS__, 'forget_page' ) );
	}

	/* ------------------------------------------------------------------ the gift page */

	/** URL of the published page that has [sawa_gift_form], or '' when there is none yet. */
	public static function page_url() {
		$id = (int) get_transient( 'sawa_t_gift_page' );
		if ( ! $id || 'publish' !== get_post_status( $id ) ) {
			$id    = 0;
			$pages = get_posts(
				array(
					'post_type'   => 'page',
					'post_status' => 'publish',
					's'           => '[sawa_gift_form',
					'numberposts' => 5,
					'fields'      => 'ids',
				)
			);
			foreach ( $pages as $p ) {
				if ( has_shortcode( (string) get_post_field( 'post_content', $p ), 'sawa_gift_form' ) ) {
					$id = (int) $p;
					break;
				}
			}
			set_transient( 'sawa_t_gift_page', $id, DAY_IN_SECONDS );
		}
		return $id ? get_permalink( $id ) : '';
	}

	public static function forget_page() {
		delete_transient( 'sawa_t_gift_page' );
	}

	/** Called after a review is saved: returns the gift page link with a one-time code, or '' when there is no gift page. */
	public static function link_for_review( $review_id ) {
		$url = self::page_url();
		if ( ! $url ) {
			return '';
		}
		$code = wp_generate_password( 32, false );
		set_transient( 'sawa_t_gift_' . md5( $code ), (int) $review_id, self::CODE_TTL );
		return add_query_arg( 'gift', $code, $url );
	}

	/** [sawa_gift_form] */
	public static function shortcode() {
		wp_enqueue_script( 'sawa-gift', SAWA_T_URL . 'assets/gift.js', array(), SAWA_T_VER, true );
		$s    = Sawa_Testimonials::settings();
		$data = array(
			'endpoint'  => esc_url_raw( rest_url( 'sawa/v1/gift' ) ),
			'reviewUrl' => esc_url_raw( home_url( '/review/' ) ),
			'radius'    => (int) $s['radius'],
			'theme'     => $s['theme'],
		);
		return '<div class="sawa-gift-form"></div><script type="application/json" class="sawa-gift-data">' . wp_json_encode( $data ) . '</script>';
	}

	/* ------------------------------------------------------------------ claiming */

	public static function rest() {
		register_rest_route(
			'sawa/v1',
			'/gift',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'claim' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	public static function claim( WP_REST_Request $r ) {
		$fail = function ( $message, $status = 400 ) {
			return new WP_REST_Response(
				array(
					'ok'      => false,
					'message' => $message,
				),
				$status
			);
		};

		if ( '' !== trim( (string) $r->get_param( 'website' ) ) ) {
			return new WP_REST_Response( array( 'ok' => true ), 200 );
		}

		$code   = preg_replace( '/[^A-Za-z0-9]/', '', (string) $r->get_param( 'gift' ) );
		$key    = 'sawa_t_gift_' . md5( $code );
		$review = $code ? (int) get_transient( $key ) : 0;
		if ( ! $review || ! get_post( $review ) ) {
			return $fail( 'This gift link has expired or was already used. Send a review to get a new one.', 403 );
		}

		$name  = sanitize_text_field( mb_substr( (string) $r->get_param( 'full_name' ), 0, 80 ) );
		$skool = sanitize_text_field( mb_substr( (string) $r->get_param( 'skool' ), 0, 80 ) );
		$email = sanitize_email( (string) $r->get_param( 'email' ) );
		if ( '' === $name ) {
			return $fail( 'Write your full name.' );
		}
		if ( '' === $skool ) {
			return $fail( 'Write your name on Skool.' );
		}
		if ( ! is_email( $email ) ) {
			return $fail( 'Write a correct email.' );
		}

		$note = 'Gift from a review · Skool: ' . $skool;
		$user = get_user_by( 'email', $email );
		if ( $user ) {
			$uid = (int) $user->ID;
			if ( 'approved' === get_user_meta( $uid, 'sawa_status', true ) || user_can( $uid, 'manage_options' ) ) {
				delete_transient( $key );
				update_post_meta( $review, '_sawa_gift_user', $uid );
				return array(
					'ok'     => true,
					'status' => 'member',
					'app'    => esc_url_raw( home_url( '/app/' ) ),
				);
			}
		} else {
			$login = sanitize_user( strtolower( strtok( $email, '@' ) ), true );
			$base  = $login ? $login : 'student';
			$i     = 1;
			while ( '' === $login || username_exists( $login ) ) {
				$login = $base . ( ++$i );
			}
			$uid = wp_insert_user(
				array(
					'user_login'   => $login,
					'user_email'   => $email,
					'user_pass'    => wp_generate_password( 24 ),
					'display_name' => $name,
					'first_name'   => strtok( $name, ' ' ),
					'role'         => 'subscriber',
				)
			);
			if ( is_wp_error( $uid ) ) {
				return $fail( 'Your gift was not saved. Try again.', 500 );
			}
			update_user_meta( $uid, 'sawa_requested', current_time( 'mysql' ) );
		}

		update_user_meta( $uid, 'sawa_skool_name', $skool );
		update_user_meta( $uid, 'sawa_request_note', $note );
		update_user_meta( $uid, '_sawa_gift', $review );
		update_user_meta( $uid, 'sawa_status', 'pending' );
		update_post_meta( $review, '_sawa_gift_user', $uid );
		delete_transient( $key );

		wp_mail(
			get_option( 'admin_email' ),
			sprintf( 'Gift claimed: %s wants the Sawa App', $name ),
			sprintf(
				"%s sent a review and claimed the gift.\n\nFull name: %s\nName on Skool: %s\nEmail: %s\n\nCheck their name on Skool, then approve them here:\n%s",
				$name,
				$name,
				$skool,
				$email,
				admin_url( 'admin.php?page=sawa-tracker' )
			)
		);

		return array(
			'ok'     => true,
			'status' => 'pending',
		);
	}

	/* ------------------------------------------------------------------ after approval */

	/** Gift students get the English email below instead of the tracker's usual welcome email. */
	public static function skip_tracker_welcome( $send, $uid ) {
		return get_user_meta( $uid, '_sawa_gift', true ) ? false : $send;
	}

	public static function status_changed( $meta_id, $uid, $key, $value ) {
		if ( 'sawa_status' !== $key || 'approved' !== $value || ! get_user_meta( $uid, '_sawa_gift', true ) || get_user_meta( $uid, '_sawa_gift_sent', true ) ) {
			return;
		}
		$user = get_userdata( $uid );
		if ( ! $user ) {
			return;
		}
		$reset = get_password_reset_key( $user );
		if ( is_wp_error( $reset ) ) {
			return;
		}
		update_user_meta( $uid, '_sawa_gift_sent', current_time( 'mysql' ) );
		$link = network_site_url( 'wp-login.php?action=rp&key=' . $reset . '&login=' . rawurlencode( $user->user_login ), 'login' );
		wp_mail(
			$user->user_email,
			'Your gift is ready: the Sawa App',
			sprintf(
				"Hi %s,\n\nThank you for your review! Your free access to the Sawa App is ready.\n\n1. Make your password here:\n%s\n\n2. Open the Sawa App:\n%s\n\nSign in with this email: %s\n\nSee you in the app,\nSherif, Sawa English",
				$user->first_name ? $user->first_name : $user->display_name,
				$link,
				home_url( '/app/' ),
				$user->user_email
			)
		);
	}
}
