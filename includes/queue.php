<?php
/**
 * Testimonials → Review queue: every review waiting for approval, in full, with one Approve and one Reject button.
 * Approve publishes it (and the gift code in gift.php gives Sawa App access). Reject sends the "please write a
 * proper review" email, which can be changed for one student first, and moves the review to the trash.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Sawa_Testimonials_Queue {

	const SLUG = 'sawa-t-queue';

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_post_sawa_t_queue', array( __CLASS__, 'handle' ) );
	}

	public static function url( $args = array() ) {
		return add_query_arg( $args, admin_url( 'edit.php?post_type=' . Sawa_Testimonials::PT . '&page=' . self::SLUG ) );
	}

	public static function menu() {
		$n     = (int) wp_count_posts( Sawa_Testimonials::PT )->pending;
		$label = 'Review queue' . ( $n ? ' <span class="awaiting-mod"><span class="pending-count">' . $n . '</span></span>' : '' );
		add_submenu_page( 'edit.php?post_type=' . Sawa_Testimonials::PT, 'Review queue', $label, 'publish_posts', self::SLUG, array( __CLASS__, 'page' ), 0 );
	}

	/** The rejection email for one review, with {name} and {review_link} filled in. */
	private static function reject_text( $post ) {
		$s = Sawa_Testimonials::settings();
		return strtr(
			$s['rejectEmail'],
			array(
				'{name}'        => strtok( $post->post_title, ' ' ),
				'{review_link}' => home_url( '/review/' ),
			)
		);
	}

	/* ------------------------------------------------------------------ actions */

	public static function handle() {
		$id = isset( $_POST['id'] ) ? (int) $_POST['id'] : 0; // phpcs:ignore WordPress.Security.NonceVerification -- checked below.
		check_admin_referer( 'sawa_t_queue_' . $id );
		$post = get_post( $id );
		if ( ! $post || Sawa_Testimonials::PT !== $post->post_type || ! current_user_can( 'publish_post', $id ) ) {
			wp_die( 'You are not allowed to do this.' );
		}
		$do    = isset( $_POST['do'] ) ? sanitize_key( $_POST['do'] ) : '';
		$email = sanitize_email( (string) get_post_meta( $id, '_sawa_email', true ) );

		if ( 'approve' === $do ) {
			wp_update_post(
				array(
					'ID'          => $id,
					'post_status' => 'publish',
				)
			);
			$access = (bool) get_post_meta( $id, '_sawa_access_sent', true );
			wp_safe_redirect( self::url( array( 'done' => $access ? 'approved_access' : 'approved' ) ) );
			exit;
		}

		if ( 'reject' === $do ) {
			$sent = false;
			if ( is_email( $email ) ) {
				$s       = Sawa_Testimonials::settings();
				$subject = isset( $_POST['subject'] ) ? sanitize_text_field( wp_unslash( $_POST['subject'] ) ) : $s['rejectSubject'];
				$message = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : self::reject_text( $post );
				$sent    = wp_mail( $email, $subject ? $subject : $s['rejectSubject'], $message ? $message : self::reject_text( $post ) );
			}
			update_post_meta( $id, '_sawa_rejected', current_time( 'mysql' ) );
			wp_trash_post( $id );
			wp_safe_redirect( self::url( array( 'done' => $sent ? 'rejected_mail' : 'rejected' ) ) );
			exit;
		}

		wp_safe_redirect( self::url() );
		exit;
	}

	/* ------------------------------------------------------------------ the page */

	public static function page() {
		$q = new WP_Query(
			array(
				'post_type'      => Sawa_Testimonials::PT,
				'post_status'    => 'pending',
				'posts_per_page' => 100,
				'orderby'        => 'date',
				'order'          => 'ASC',
				'no_found_rows'  => true,
			)
		);
		$done  = isset( $_GET['done'] ) ? sanitize_key( $_GET['done'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
		$notes = array(
			'approved_access' => array( 'success', 'Approved. The review is on the wall, and the student got Sawa App access and a welcome email.' ),
			'approved'        => array( 'success', 'Approved. The review is on the wall. It had no email, so no Sawa App access was sent.' ),
			'rejected_mail'   => array( 'warning', 'Rejected. The review is in the trash and the student got your email.' ),
			'rejected'        => array( 'warning', 'Rejected. The review is in the trash. It had no email, so no email was sent.' ),
		);
		?>
		<div class="wrap">
			<h1>Review queue</h1>
			<?php if ( isset( $notes[ $done ] ) ) : ?>
				<div class="notice notice-<?php echo esc_attr( $notes[ $done ][0] ); ?> is-dismissible"><p><?php echo esc_html( $notes[ $done ][1] ); ?></p></div>
			<?php endif; ?>
			<p>
				<b>Approve</b> puts the review on the wall, gives the student Sawa App access and sends them a welcome email.
				<b>Reject</b> sends them an email asking for a better review (you can change it first) and moves the review to the trash.
				Change the default email in <a href="<?php echo esc_url( admin_url( 'edit.php?post_type=' . Sawa_Testimonials::PT . '&page=sawa-t-settings' ) ); ?>">Settings</a>.
			</p>
			<style>
				.sawa-q{display:grid;gap:16px;max-width:860px;margin-top:16px}
				.sawa-q-card{background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:18px;display:grid;gap:12px}
				.sawa-q-hd{display:flex;gap:14px;align-items:center}
				.sawa-q-av{width:56px;height:56px;border-radius:50%;object-fit:cover;background:#f0f0f1;flex:none}
				.sawa-q-name{font-size:16px;font-weight:600}
				.sawa-q-sub,.sawa-q-facts{color:#50575e;font-size:13px}
				.sawa-q-facts{display:flex;flex-wrap:wrap;gap:4px 18px}.sawa-q-facts b{color:#1d2327}
				.sawa-q-text{direction:rtl;text-align:right;unicode-bidi:plaintext;white-space:pre-line;font-size:15px;line-height:1.8;background:#f6f7f7;border-radius:6px;padding:12px 14px;margin:0}
				.sawa-q-acts{display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap}
				.sawa-q-acts form{margin:0}
				.sawa-q .button-approve{background:#1d6b3a;border-color:#1d6b3a;color:#fff}
				.sawa-q .button-approve:hover{background:#155a30;border-color:#155a30;color:#fff}
				.sawa-q details{flex:1;min-width:280px}
				.sawa-q summary{list-style:none;display:inline-block;cursor:pointer}.sawa-q summary::-webkit-details-marker{display:none}
				.sawa-q .button-reject{color:#b32d2e;border-color:#b32d2e}
				.sawa-q-mail{display:grid;gap:8px;margin-top:10px;padding:12px;border:1px solid #dcdcde;border-radius:6px;background:#fcfcfc}
				.sawa-q-mail textarea{width:100%;min-height:240px}
				.sawa-q-warn{background:#fcf9e8;border-left:4px solid #dba617;padding:8px 10px;margin:0}
			</style>
			<?php if ( ! $q->posts ) : ?>
				<p><b>No reviews are waiting.</b> New ones show up here, and you get an email for each one.</p>
			<?php endif; ?>
			<div class="sawa-q">
			<?php
			foreach ( $q->posts as $p ) :
				$m      = function ( $k ) use ( $p ) {
					return (string) get_post_meta( $p->ID, '_sawa_' . $k, true );
				};
				$kind   = $m( 'type' ) ? $m( 'type' ) : 'text';
				$media  = $m( 'media' );
				$email  = $m( 'email' );
				$rating = (int) $m( 'rating' );
				$words  = count( preg_split( '/\s+/u', trim( wp_strip_all_tags( $p->post_content ) ), -1, PREG_SPLIT_NO_EMPTY ) );
				$nonce  = wp_nonce_field( 'sawa_t_queue_' . $p->ID, '_wpnonce', true, false );
				$hidden = '<input type="hidden" name="action" value="sawa_t_queue"><input type="hidden" name="id" value="' . (int) $p->ID . '">' . $nonce;
				?>
				<div class="sawa-q-card">
					<div class="sawa-q-hd">
						<?php if ( $m( 'avatar' ) ) : ?>
							<img class="sawa-q-av" src="<?php echo esc_url( $m( 'avatar' ) ); ?>" alt="">
						<?php else : ?>
							<span class="sawa-q-av"></span>
						<?php endif; ?>
						<div>
							<div class="sawa-q-name"><?php echo esc_html( $p->post_title ); ?></div>
							<div class="sawa-q-sub">
								<?php
								echo esc_html(
									implode(
										' · ',
										array_filter(
											array(
												$m( 'role' ),
												( Sawa_Testimonials::TYPES[ $kind ] ?? 'Written' ) . ' review',
												$rating ? str_repeat( '★', $rating ) : '',
												human_time_diff( get_post_time( 'U', true, $p ) ) . ' ago',
											)
										)
									)
								);
								?>
							</div>
						</div>
					</div>

					<?php if ( 'audio' === $kind && $media ) : ?>
						<audio controls preload="none" src="<?php echo esc_url( $media ); ?>"></audio>
					<?php elseif ( 'video' === $kind && $media ) : ?>
						<?php if ( preg_match( '~(youtube\.com|youtu\.be|loom\.com)~i', $media ) ) : ?>
							<p><a href="<?php echo esc_url( $media ); ?>" target="_blank" rel="noopener">Watch the video ↗</a></p>
						<?php else : ?>
							<video controls preload="metadata" style="max-width:100%;max-height:360px" src="<?php echo esc_url( $media ); ?>"></video>
						<?php endif; ?>
					<?php endif; ?>
					<?php if ( '' !== trim( $p->post_content ) ) : ?>
						<p class="sawa-q-text" dir="auto"><?php echo esc_html( $p->post_content ); ?></p>
					<?php endif; ?>

					<div class="sawa-q-facts">
						<span>Skool: <b><?php echo esc_html( $m( 'skool' ) ? $m( 'skool' ) : '—' ); ?></b></span>
						<span>Email: <b><?php echo esc_html( $email ? $email : 'none' ); ?></b></span>
						<span>Words: <b><?php echo (int) $words; ?></b></span>
						<span><a href="<?php echo esc_url( get_edit_post_link( $p->ID ) ); ?>">Edit</a></span>
					</div>

					<div class="sawa-q-acts">
						<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
							<?php echo $hidden; // phpcs:ignore WordPress.Security.EscapeOutput -- built above from escaped parts. ?>
							<button class="button button-approve" name="do" value="approve">Approve</button>
						</form>
						<details>
							<summary class="button button-reject">Reject…</summary>
							<form class="sawa-q-mail" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
								<?php echo $hidden; // phpcs:ignore WordPress.Security.EscapeOutput -- built above from escaped parts. ?>
								<?php if ( is_email( $email ) ) : ?>
									<label>Email to <b><?php echo esc_html( $email ); ?></b> · Subject<br><input type="text" class="large-text" name="subject" value="<?php echo esc_attr( Sawa_Testimonials::settings()['rejectSubject'] ); ?>"></label>
									<textarea name="message"><?php echo esc_textarea( self::reject_text( $p ) ); ?></textarea>
									<div><button class="button button-reject" name="do" value="reject">Reject and send email</button></div>
								<?php else : ?>
									<p class="sawa-q-warn">This review has no email (it was sent before the form asked for one), so it will be rejected without an email.</p>
									<div><button class="button button-reject" name="do" value="reject">Reject</button></div>
								<?php endif; ?>
							</form>
						</details>
					</div>
				</div>
			<?php endforeach; ?>
			</div>
		</div>
		<?php
	}
}
