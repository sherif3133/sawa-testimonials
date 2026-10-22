<?php
/**
 * The gift for a review: free access to the Sawa App.
 * The review form asks for the student's Skool name and email. When Sherif approves the review (Review queue,
 * the Approve link, bulk approve or Publish — any way it goes from pending to published), the student gets a
 * Sawa Tracker account that is already approved, and an English email with a link to make a password and open the app.
 * Rejecting a review in the Review queue sends the "please write a proper review" email instead (see admin.php).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Sawa_Testimonials_Gift {

	public static function init() {
		// The old gift page (/gift/) now shows the review form, so links to it still work.
		add_shortcode( 'sawa_gift_form', array( 'Sawa_Testimonials', 'shortcode_form' ) );
		add_action( 'transition_post_status', array( __CLASS__, 'on_publish' ), 10, 3 );
		add_action( 'added_user_meta', array( __CLASS__, 'status_changed' ), 10, 4 );
		add_action( 'updated_user_meta', array( __CLASS__, 'status_changed' ), 10, 4 );
		add_filter( 'sawa_tracker_welcome_email', array( __CLASS__, 'skip_tracker_welcome' ), 10, 2 );
	}

	/* ------------------------------------------------------------------ approval gives access */

	public static function on_publish( $new, $old, $post ) {
		if ( 'publish' !== $new || 'publish' === $old || Sawa_Testimonials::PT !== $post->post_type ) {
			return;
		}
		if ( get_post_meta( $post->ID, '_sawa_email', true ) && ! get_post_meta( $post->ID, '_sawa_access_sent', true ) ) {
			self::grant( $post->ID );
		}
	}

	/** Gives the reviewer an approved Sawa Tracker account and emails them. Returns the user id, or 0. */
	public static function grant( $review_id ) {
		$email = sanitize_email( (string) get_post_meta( $review_id, '_sawa_email', true ) );
		if ( ! is_email( $email ) ) {
			return 0;
		}
		$name  = (string) get_post_field( 'post_title', $review_id );
		$skool = (string) get_post_meta( $review_id, '_sawa_skool', true );
		$user  = get_user_by( 'email', $email );
		$new   = ! $user;
		if ( $new ) {
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
				return 0;
			}
			$user = get_userdata( $uid );
			update_user_meta( $uid, 'sawa_requested', current_time( 'mysql' ) );
		}
		$uid = (int) $user->ID;
		update_user_meta( $uid, '_sawa_gift', $review_id );
		update_user_meta( $uid, '_sawa_gift_sent', current_time( 'mysql' ) ); // the email below is the welcome
		if ( $skool ) {
			update_user_meta( $uid, 'sawa_skool_name', $skool );
			update_user_meta( $uid, 'sawa_request_note', 'Gift from a review · Skool: ' . $skool );
		}
		update_user_meta( $uid, 'sawa_status', 'approved' );
		if ( class_exists( 'Sawa_Tracker_Game' ) && method_exists( 'Sawa_Tracker_Game', 'bust_boards' ) ) {
			Sawa_Tracker_Game::bust_boards();
		}
		update_post_meta( $review_id, '_sawa_gift_user', $uid );
		update_post_meta( $review_id, '_sawa_access_sent', current_time( 'mysql' ) );
		self::welcome( $user, $new );
		return $uid;
	}

	private static function welcome( $user, $new_account ) {
		$first = $user->first_name ? $user->first_name : $user->display_name;
		if ( $new_account ) {
			$key = get_password_reset_key( $user );
			if ( is_wp_error( $key ) ) {
				return;
			}
			$steps = sprintf(
				"1. Make your password here:\n%s\n\n2. Open the Sawa App:\n%s\n\nSign in with this email: %s",
				network_site_url( 'wp-login.php?action=rp&key=' . $key . '&login=' . rawurlencode( $user->user_login ), 'login' ),
				home_url( '/app/' ),
				$user->user_email
			);
		} else {
			$steps = sprintf(
				"Open the Sawa App and sign in with %s:\n%s\n\nForgot your password? Make a new one here:\n%s",
				$user->user_email,
				home_url( '/app/' ),
				wp_lostpassword_url( home_url( '/app/' ) )
			);
		}
		wp_mail(
			$user->user_email,
			'Your gift is ready: the Sawa App',
			sprintf( "Hi %s,\n\nThank you for your review! It is now on our website, and your free access to the Sawa App is ready.\n\n%s\n\nSee you in the app,\nSherif, Sawa English", $first, $steps )
		);
	}

	/* ------------------------------------------------------------------ older gift requests */

	/** Gift students get the English email instead of the tracker's usual welcome email. */
	public static function skip_tracker_welcome( $send, $uid ) {
		return get_user_meta( $uid, '_sawa_gift', true ) ? false : $send;
	}

	/** Requests from the old gift page (approved in Sawa Tracker → Access requests) still get the English email. */
	public static function status_changed( $meta_id, $uid, $key, $value ) {
		if ( 'sawa_status' !== $key || 'approved' !== $value || ! get_user_meta( $uid, '_sawa_gift', true ) || get_user_meta( $uid, '_sawa_gift_sent', true ) ) {
			return;
		}
		$user = get_userdata( $uid );
		if ( $user ) {
			update_user_meta( $uid, '_sawa_gift_sent', current_time( 'mysql' ) );
			self::welcome( $user, true );
		}
	}
}
