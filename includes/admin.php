<?php
/**
 * Dashboard screens: the testimonials list, the edit screen and the settings page.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Sawa_Testimonials_Admin {

	const PT = Sawa_Testimonials::PT;

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_menu', array( __CLASS__, 'pending_bubble' ), 99 );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_filter( 'enter_title_here', array( __CLASS__, 'title_placeholder' ), 10, 2 );
		add_action( 'add_meta_boxes_' . self::PT, array( __CLASS__, 'meta_boxes' ) );
		add_filter( 'wp_insert_post_data', array( __CLASS__, 'save_text' ), 10, 2 );
		add_action( 'save_post_' . self::PT, array( __CLASS__, 'save_meta' ), 10, 2 );

		add_filter( 'manage_' . self::PT . '_posts_columns', array( __CLASS__, 'columns' ) );
		add_action( 'manage_' . self::PT . '_posts_custom_column', array( __CLASS__, 'column' ), 10, 2 );
		add_filter( 'post_row_actions', array( __CLASS__, 'row_actions' ), 10, 2 );
		add_filter( 'views_edit-' . self::PT, array( __CLASS__, 'views' ) );
		add_filter( 'bulk_actions-edit-' . self::PT, array( __CLASS__, 'bulk_actions' ) );
		add_filter( 'handle_bulk_actions-edit-' . self::PT, array( __CLASS__, 'handle_bulk' ), 10, 3 );
		add_action( 'restrict_manage_posts', array( __CLASS__, 'source_filter' ) );
		add_action( 'pre_get_posts', array( __CLASS__, 'apply_source_filter' ) );
		add_action( 'admin_notices', array( __CLASS__, 'notices' ) );
		add_filter( 'post_updated_messages', array( __CLASS__, 'messages' ) );

		add_action( 'admin_post_sawa_t_approve', array( __CLASS__, 'approve' ) );
		add_action( 'admin_post_sawa_t_import', array( __CLASS__, 'import' ) );
		add_action( 'wp_ajax_sawa_t_set', array( __CLASS__, 'ajax_set' ) );
		add_action( 'wp_ajax_sawa_t_localize', array( __CLASS__, 'ajax_localize' ) );
	}

	private static function is_ours() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		return $screen && self::PT === $screen->post_type;
	}

	/* ------------------------------------------------------------------ menu + assets */

	public static function menu() {
		add_submenu_page( 'edit.php?post_type=' . self::PT, 'Testimonial settings', 'Settings & import', 'manage_options', 'sawa-t-settings', array( __CLASS__, 'settings_page' ) );
	}

	public static function pending_bubble() {
		global $menu;
		$n = (int) wp_count_posts( self::PT )->pending;
		if ( ! $n || ! is_array( $menu ) ) {
			return;
		}
		foreach ( $menu as $i => $item ) {
			if ( isset( $item[2] ) && 'edit.php?post_type=' . self::PT === $item[2] ) {
				$menu[ $i ][0] .= ' <span class="awaiting-mod"><span class="pending-count">' . $n . '</span></span>'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride
			}
		}
	}

	public static function assets() {
		if ( ! self::is_ours() ) {
			return;
		}
		wp_enqueue_media();
		wp_enqueue_style( 'sawa-admin', SAWA_T_URL . 'assets/admin.css', array(), SAWA_T_VER );
		wp_enqueue_script( 'sawa-admin', SAWA_T_URL . 'assets/admin.js', array( 'jquery' ), SAWA_T_VER, true );
		wp_localize_script(
			'sawa-admin',
			'SawaT',
			array(
				'ajax'  => admin_url( 'admin-ajax.php' ),
				'nonce' => wp_create_nonce( 'sawa_t' ),
			)
		);
	}

	public static function messages( $messages ) {
		$messages[ self::PT ] = array(
			1  => 'Testimonial updated.',
			4  => 'Testimonial updated.',
			6  => 'Testimonial published. It is on the wall now.',
			7  => 'Testimonial saved.',
			8  => 'Testimonial saved and waiting for approval.',
			10 => 'Draft saved. It is not on the wall yet.',
		);
		return $messages;
	}

	public static function title_placeholder( $text, $post ) {
		return self::PT === $post->post_type ? "Student's name" : $text;
	}

	/* ------------------------------------------------------------------ edit screen */

	public static function meta_boxes() {
		add_meta_box( 'sawa_details', 'Testimonial', array( __CLASS__, 'details_box' ), self::PT, 'normal', 'high' );
		add_meta_box( 'sawa_preview', 'How it looks', array( __CLASS__, 'preview_box' ), self::PT, 'side', 'default' );
	}

	private static function select( $name, $options, $current, $attrs = '' ) {
		$h = '<select name="' . esc_attr( $name ) . '" ' . $attrs . '>';
		foreach ( $options as $value => $label ) {
			$h .= '<option value="' . esc_attr( $value ) . '"' . selected( (string) $current, (string) $value, false ) . '>' . esc_html( $label ) . '</option>';
		}
		return $h . '</select>';
	}

	public static function details_box( $post ) {
		$m = function ( $k, $d = '' ) use ( $post ) {
			return Sawa_Testimonials::meta( $post->ID, $k, $d );
		};
		$sources = array_combine( Sawa_Testimonials::SOURCES, Sawa_Testimonials::SOURCES );
		$ratings = array(
			0 => 'No rating',
			5 => '★★★★★ 5',
			4 => '★★★★ 4',
			3 => '★★★ 3',
			2 => '★★ 2',
			1 => '★ 1',
		);
		wp_nonce_field( 'sawa_t_save', 'sawa_t_nonce' );
		$is_new = 'auto-draft' === $post->post_status;
		?>
		<div class="sawa-fields">
			<p class="sawa-row">
				<label><strong>Where it came from</strong><br>
					<span class="sawa-src-wrap"><span class="sawa-ic" data-src="<?php echo esc_attr( $m( 'source', $is_new ? 'Skool' : 'Other' ) ); ?>"></span>
					<?php echo self::select( 'sawa[source]', $sources, $m( 'source', $is_new ? 'Skool' : 'Other' ), 'class="sawa-src-edit"' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
				</label>
				<label><strong>Type</strong><br>
					<?php echo self::select( 'sawa[type]', Sawa_Testimonials::TYPES, $m( 'type', 'text' ), 'class="sawa-type"' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</label>
				<label><strong>Rating</strong><br>
					<?php echo self::select( 'sawa[rating]', $ratings, (int) $m( 'rating', $is_new ? 5 : 0 ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
				</label>
			</p>
			<p>
				<label for="sawa-role"><strong>Role or handle</strong> <span class="description">optional, e.g. “Student, B1 level”</span></label><br>
				<input type="text" id="sawa-role" name="sawa[role]" value="<?php echo esc_attr( $m( 'role' ) ); ?>" class="widefat" dir="auto">
			</p>
			<p>
				<label for="sawa-text"><strong>What they said</strong> <span class="description">Wrap words in **double asterisks** to make them bold.</span></label><br>
				<textarea id="sawa-text" name="sawa_text" rows="7" class="widefat" dir="auto"><?php echo esc_textarea( $post->post_content ); ?></textarea>
			</p>
			<div class="sawa-media-field">
				<label for="sawa-media"><strong class="sawa-media-label">Image, video or voice file</strong> <span class="description sawa-media-hint"></span></label>
				<div class="sawa-inline">
					<input type="url" id="sawa-media" name="sawa[media]" value="<?php echo esc_attr( $m( 'media' ) ); ?>" class="widefat" placeholder="https://">
					<button type="button" class="button sawa-pick" data-target="#sawa-media">Choose from media library</button>
				</div>
			</div>
			<p>
				<label for="sawa-link"><strong>Link to the original post</strong> <span class="description">optional; the source icon links here</span></label><br>
				<input type="url" id="sawa-link" name="sawa[link]" value="<?php echo esc_attr( $m( 'link' ) ); ?>" class="widefat" placeholder="https://www.skool.com/…">
			</p>
			<div>
				<label for="sawa-avatar"><strong>Profile photo</strong> <span class="description">optional; initials are shown otherwise</span></label>
				<div class="sawa-inline">
					<span class="sawa-avatar-prev"><?php echo $m( 'avatar' ) ? '<img src="' . esc_url( $m( 'avatar' ) ) . '" alt="">' : ''; ?></span>
					<input type="url" id="sawa-avatar" name="sawa[avatar]" value="<?php echo esc_attr( $m( 'avatar' ) ); ?>" class="widefat" placeholder="https://">
					<button type="button" class="button sawa-pick" data-target="#sawa-avatar" data-kind="image">Choose photo</button>
				</div>
			</div>
			<p class="sawa-checks">
				<label><input type="checkbox" name="sawa[featured]" value="1" <?php checked( $m( 'featured', 0 ), 1 ); ?>> Featured: show first, and include in <code>[sawa_testimonials featured="yes"]</code></label><br>
				<label><input type="checkbox" name="sawa[noname]" value="1" <?php checked( $m( 'noname', 0 ), 1 ); ?>> Hide the name on the wall</label><br>
				<label><input type="checkbox" name="sawa[nodate]" value="1" <?php checked( $m( 'nodate', 0 ), 1 ); ?>> Hide the date on the wall</label>
			</p>
			<p class="description">The date shown on the wall is the date in the <b>Publish</b> box. Click <b>Edit</b> next to it to change it.</p>
		</div>
		<?php
	}

	public static function preview_box( $post ) {
		if ( 'auto-draft' === $post->post_status ) {
			echo '<p class="description">Save the testimonial to see a preview.</p>';
			return;
		}
		wp_enqueue_script( 'sawa-wall', SAWA_T_URL . 'assets/wall.js', array(), SAWA_T_VER, true );
		$settings                = Sawa_Testimonials::wall_settings();
		$settings['title']       = '';
		$settings['subtitle']    = '';
		$settings['showSummary'] = false;
		$settings['showFilters'] = false;
		$settings['maxColumns']  = 1;
		$item                    = Sawa_Testimonials::item( $post );
		$data                    = array(
			'settings' => $settings,
			'items'    => array( $item ),
		);
		echo '<div class="sawa-preview-stage ' . esc_attr( $settings['theme'] ) . '"><div class="sawa-wall"></div><script type="application/json" class="sawa-wall-data">' . wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script></div>';
		if ( 'publish' !== $post->post_status ) {
			echo '<p class="description">Not on the wall yet. Click <b>Publish</b> to approve it.</p>';
		}
	}

	public static function save_text( $data, $postarr ) {
		if ( self::PT === $data['post_type'] && isset( $_POST['sawa_t_nonce'], $_POST['sawa_text'] ) && wp_verify_nonce( sanitize_key( $_POST['sawa_t_nonce'] ), 'sawa_t_save' ) ) {
			$data['post_content'] = sanitize_textarea_field( wp_unslash( $_POST['sawa_text'] ) );
		}
		return $data;
	}

	public static function save_meta( $post_id, $post ) {
		if ( ! isset( $_POST['sawa_t_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['sawa_t_nonce'] ), 'sawa_t_save' ) ) {
			return;
		}
		if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		$in = isset( $_POST['sawa'] ) && is_array( $_POST['sawa'] ) ? wp_unslash( $_POST['sawa'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		$source = in_array( $in['source'] ?? '', Sawa_Testimonials::SOURCES, true ) ? $in['source'] : 'Other';
		$type   = array_key_exists( $in['type'] ?? '', Sawa_Testimonials::TYPES ) ? $in['type'] : 'text';
		update_post_meta( $post_id, '_sawa_source', $source );
		update_post_meta( $post_id, '_sawa_type', $type );
		update_post_meta( $post_id, '_sawa_rating', max( 0, min( 5, (int) ( $in['rating'] ?? 0 ) ) ) );
		update_post_meta( $post_id, '_sawa_role', sanitize_text_field( $in['role'] ?? '' ) );
		update_post_meta( $post_id, '_sawa_media', esc_url_raw( $in['media'] ?? '' ) );
		update_post_meta( $post_id, '_sawa_link', esc_url_raw( $in['link'] ?? '' ) );
		update_post_meta( $post_id, '_sawa_avatar', esc_url_raw( $in['avatar'] ?? '' ) );
		foreach ( array( 'featured', 'noname', 'nodate' ) as $flag ) {
			update_post_meta( $post_id, '_sawa_' . $flag, empty( $in[ $flag ] ) ? 0 : 1 );
		}
	}

	/* ------------------------------------------------------------------ list screen */

	public static function columns( $cols ) {
		return array(
			'cb'            => $cols['cb'],
			'sawa_photo'    => '',
			'title'         => 'Name',
			'sawa_source'   => 'Source',
			'sawa_review'   => 'Review',
			'sawa_rating'   => 'Rating',
			'sawa_featured' => '<span title="Featured">★</span>',
			'date'          => 'Date',
		);
	}

	public static function column( $col, $post_id ) {
		$m = function ( $k, $d = '' ) use ( $post_id ) {
			return Sawa_Testimonials::meta( $post_id, $k, $d );
		};
		switch ( $col ) {
			case 'sawa_photo':
				$a = $m( 'avatar' );
				echo $a ? '<img class="sawa-thumb" src="' . esc_url( $a ) . '" alt="" loading="lazy">' : '<span class="sawa-thumb sawa-initials">' . esc_html( mb_strtoupper( mb_substr( get_the_title( $post_id ), 0, 1 ) ) ) . '</span>';
				break;
			case 'sawa_source':
				$src = $m( 'source', 'Other' );
				echo '<span class="sawa-src-wrap"><span class="sawa-ic" data-src="' . esc_attr( $src ) . '"></span>';
				echo self::select( 'sawa_src_' . $post_id, array_combine( Sawa_Testimonials::SOURCES, Sawa_Testimonials::SOURCES ), $src, 'class="sawa-src" data-id="' . (int) $post_id . '" aria-label="Source"' ); // phpcs:ignore WordPress.Security.EscapeOutput
				echo '<span class="sawa-saved" aria-live="polite"></span></span>';
				break;
			case 'sawa_review':
				$type  = $m( 'type', 'text' );
				$media = $m( 'media' );
				$text  = wp_strip_all_tags( str_replace( '**', '', get_post_field( 'post_content', $post_id ) ) );
				echo '<span class="sawa-type-tag">' . esc_html( Sawa_Testimonials::TYPES[ $type ] ?? 'Written' ) . '</span> ';
				echo '<span dir="auto">' . esc_html( wp_trim_words( $text, 28, '…' ) ) . '</span>';
				if ( 'audio' === $type && $media ) {
					echo '<br><audio controls preload="none" src="' . esc_url( $media ) . '" class="sawa-audio"></audio>';
				} elseif ( $media && in_array( $type, array( 'video', 'image' ), true ) ) {
					echo '<br><a href="' . esc_url( $media ) . '" target="_blank" rel="noopener">' . ( 'video' === $type ? 'Watch the video ↗' : 'See the image ↗' ) . '</a>';
				}
				break;
			case 'sawa_rating':
				$r = (int) $m( 'rating', 0 );
				echo $r ? '<span class="sawa-stars" title="' . $r . ' out of 5">' . str_repeat( '★', $r ) . '</span>' : '—'; // phpcs:ignore WordPress.Security.EscapeOutput
				break;
			case 'sawa_featured':
				$f = (int) $m( 'featured', 0 );
				echo '<button type="button" class="sawa-feat" data-id="' . (int) $post_id . '" aria-pressed="' . ( $f ? 'true' : 'false' ) . '" title="' . ( $f ? 'Featured (click to remove)' : 'Click to feature' ) . '">' . ( $f ? '★' : '☆' ) . '</button>';
				break;
		}
	}

	public static function row_actions( $actions, $post ) {
		if ( self::PT !== $post->post_type ) {
			return $actions;
		}
		unset( $actions['inline hide-if-no-js'] );
		if ( 'pending' === $post->post_status && current_user_can( 'publish_post', $post->ID ) ) {
			$url     = wp_nonce_url( admin_url( 'admin-post.php?action=sawa_t_approve&id=' . $post->ID ), 'sawa_t_approve_' . $post->ID );
			$actions = array( 'sawa_approve' => '<a href="' . esc_url( $url ) . '" class="sawa-approve">Approve</a>' ) + $actions;
		}
		return $actions;
	}

	public static function views( $views ) {
		if ( isset( $views['publish'] ) ) {
			$views['publish'] = str_replace( 'Published', 'On the wall', $views['publish'] );
		}
		if ( isset( $views['pending'] ) ) {
			$views['pending'] = str_replace( 'Pending', 'Waiting for approval', $views['pending'] );
		}
		return $views;
	}

	public static function bulk_actions( $actions ) {
		return array( 'sawa_approve' => 'Approve (put on the wall)' ) + $actions;
	}

	public static function handle_bulk( $redirect, $action, $ids ) {
		if ( 'sawa_approve' !== $action ) {
			return $redirect;
		}
		$n = 0;
		foreach ( $ids as $id ) {
			if ( current_user_can( 'publish_post', $id ) ) {
				wp_publish_post( $id );
				++$n;
			}
		}
		return add_query_arg( 'sawa_approved', $n, $redirect );
	}

	public static function approve() {
		$id = isset( $_GET['id'] ) ? (int) $_GET['id'] : 0;
		check_admin_referer( 'sawa_t_approve_' . $id );
		if ( ! current_user_can( 'publish_post', $id ) ) {
			wp_die( 'You are not allowed to approve this testimonial.' );
		}
		wp_publish_post( $id );
		wp_safe_redirect( add_query_arg( 'sawa_approved', 1, wp_get_referer() ? wp_get_referer() : admin_url( 'edit.php?post_type=' . self::PT ) ) );
		exit;
	}

	public static function source_filter( $post_type ) {
		if ( self::PT !== $post_type ) {
			return;
		}
		$current = isset( $_GET['sawa_source'] ) ? sanitize_text_field( wp_unslash( $_GET['sawa_source'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
		echo self::select( 'sawa_source', array( '' => 'All sources' ) + array_combine( Sawa_Testimonials::SOURCES, Sawa_Testimonials::SOURCES ), $current ); // phpcs:ignore WordPress.Security.EscapeOutput
	}

	public static function apply_source_filter( $q ) {
		if ( ! is_admin() || ! $q->is_main_query() || self::PT !== $q->get( 'post_type' ) || empty( $_GET['sawa_source'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}
		$q->set(
			'meta_query',
			array(
				array(
					'key'   => '_sawa_source',
					'value' => sanitize_text_field( wp_unslash( $_GET['sawa_source'] ) ), // phpcs:ignore WordPress.Security.NonceVerification
				),
			)
		);
	}

	public static function notices() {
		if ( ! self::is_ours() ) {
			return;
		}
		// phpcs:disable WordPress.Security.NonceVerification
		if ( isset( $_GET['sawa_approved'] ) ) {
			$n = (int) $_GET['sawa_approved'];
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $n . ' testimonial' . ( 1 === $n ? ' is' : 's are' ) . ' now on the wall.' ) . '</p></div>';
		}
		if ( isset( $_GET['sawa_import'] ) ) {
			$msg = get_transient( 'sawa_t_import_msg' );
			if ( $msg ) {
				echo '<div class="notice notice-' . ( 'ok' === $_GET['sawa_import'] ? 'success' : 'error' ) . ' is-dismissible"><p>' . esc_html( $msg ) . '</p></div>';
			}
		}
		// phpcs:enable
	}

	/* ------------------------------------------------------------------ AJAX */

	public static function ajax_set() {
		check_ajax_referer( 'sawa_t', 'nonce' );
		$id    = isset( $_POST['id'] ) ? (int) $_POST['id'] : 0;
		$field = isset( $_POST['field'] ) ? sanitize_key( $_POST['field'] ) : '';
		$value = isset( $_POST['value'] ) ? sanitize_text_field( wp_unslash( $_POST['value'] ) ) : '';
		if ( ! $id || self::PT !== get_post_type( $id ) || ! current_user_can( 'edit_post', $id ) ) {
			wp_send_json_error( 'You are not allowed to change this testimonial.' );
		}
		if ( 'source' === $field && in_array( $value, Sawa_Testimonials::SOURCES, true ) ) {
			update_post_meta( $id, '_sawa_source', $value );
		} elseif ( 'featured' === $field ) {
			update_post_meta( $id, '_sawa_featured', '1' === $value ? 1 : 0 );
		} else {
			wp_send_json_error( 'Unknown change.' );
		}
		wp_send_json_success();
	}

	/** Copies photos still hosted on Famewall into the media library, a few per request. */
	public static function ajax_localize() {
		check_ajax_referer( 'sawa_t', 'nonce' );
		if ( ! current_user_can( 'upload_files' ) || ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error( 'You are not allowed to upload files.' );
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		global $wpdb;
		$like  = '%' . $wpdb->esc_like( 'famewall.io/' ) . '%';
		$rows  = $wpdb->get_results( $wpdb->prepare( "SELECT post_id, meta_key, meta_value FROM {$wpdb->postmeta} WHERE meta_key IN ('_sawa_avatar','_sawa_media') AND meta_value LIKE %s", $like ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		$failed = get_option( 'sawa_t_localize_failed', array() );
		$todo   = array_values(
			array_filter(
				$rows,
				function ( $r ) use ( $failed ) {
					return ! in_array( $r->meta_value, $failed, true );
				}
			)
		);
		$done = 0;
		foreach ( array_slice( $todo, 0, 5 ) as $r ) {
			$url = self::sideload( $r->meta_value, (int) $r->post_id );
			if ( is_wp_error( $url ) ) {
				$failed[] = $r->meta_value;
			} else {
				update_post_meta( (int) $r->post_id, $r->meta_key, $url );
				++$done;
			}
		}
		update_option( 'sawa_t_localize_failed', $failed, false );
		wp_send_json_success(
			array(
				'done'      => $done,
				'remaining' => max( 0, count( $todo ) - 5 ),
				'failed'    => count( $failed ),
			)
		);
	}

	private static function sideload( $url, $post_id ) {
		$tmp = download_url( $url, 30 );
		if ( is_wp_error( $tmp ) ) {
			return $tmp;
		}
		$mime = function_exists( 'wp_get_image_mime' ) ? wp_get_image_mime( $tmp ) : '';
		$exts = array(
			'image/jpeg' => 'jpg',
			'image/png'  => 'png',
			'image/webp' => 'webp',
			'image/gif'  => 'gif',
		);
		if ( empty( $exts[ $mime ] ) ) {
			wp_delete_file( $tmp );
			return new WP_Error( 'type', 'Not an image' );
		}
		$id = media_handle_sideload(
			array(
				'name'     => 'testimonial-' . substr( md5( $url ), 0, 10 ) . '.' . $exts[ $mime ],
				'tmp_name' => $tmp,
			),
			$post_id
		);
		if ( is_wp_error( $id ) ) {
			wp_delete_file( $tmp );
			return $id;
		}
		return wp_get_attachment_url( $id );
	}

	/* ------------------------------------------------------------------ settings + import */

	public static function register_settings() {
		register_setting(
			'sawa_t',
			Sawa_Testimonials::OPT,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize' ),
			)
		);
	}

	public static function sanitize( $in ) {
		$d   = Sawa_Testimonials::defaults();
		$in  = is_array( $in ) ? $in : array();
		$out = array();
		foreach ( array( 'title', 'subtitle', 'moreLabel', 'formTitle', 'formConsent', 'formButton', 'formThanks', 'formExamples', 'famewallWall' ) as $k ) {
			$out[ $k ] = isset( $in[ $k ] ) ? sanitize_text_field( $in[ $k ] ) : $d[ $k ];
		}
		$out['formIntro']    = isset( $in['formIntro'] ) ? sanitize_textarea_field( $in['formIntro'] ) : $d['formIntro'];
		$out['accent']       = sanitize_hex_color( $in['accent'] ?? '' ) ? sanitize_hex_color( $in['accent'] ) : $d['accent'];
		$out['theme']        = in_array( $in['theme'] ?? '', array( 'light', 'dark' ), true ) ? $in['theme'] : $d['theme'];
		$out['font']         = in_array( $in['font'] ?? '', Sawa_Testimonials::FONTS, true ) ? $in['font'] : $d['font'];
		$out['radius']       = max( 0, min( 28, (int) ( $in['radius'] ?? $d['radius'] ) ) );
		$out['maxColumns']   = max( 1, min( 4, (int) ( $in['maxColumns'] ?? $d['maxColumns'] ) ) );
		$out['initialCount'] = max( 1, min( 500, (int) ( $in['initialCount'] ?? $d['initialCount'] ) ) );
		foreach ( array( 'showSummary', 'showFilters', 'showRatings', 'showSources', 'showDates', 'notify' ) as $k ) {
			$out[ $k ] = empty( $in[ $k ] ) ? 0 : 1;
		}
		return $out;
	}

	public static function import() {
		check_admin_referer( 'sawa_t_import' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'You are not allowed to import testimonials.' );
		}
		$wall = isset( $_POST['wall'] ) ? sanitize_text_field( wp_unslash( $_POST['wall'] ) ) : '';
		$s    = Sawa_Testimonials::settings();
		if ( $wall && $wall !== $s['famewallWall'] ) {
			$s['famewallWall'] = $wall;
			update_option( Sawa_Testimonials::OPT, $s );
		}
		$res = Sawa_Testimonials::import_famewall( $wall ? $wall : $s['famewallWall'] );
		if ( is_wp_error( $res ) ) {
			set_transient( 'sawa_t_import_msg', 'Import failed: ' . $res->get_error_message(), 60 );
			$status = 'error';
		} else {
			set_transient(
				'sawa_t_import_msg',
				$res['added']
					? sprintf( 'Imported %d testimonials from Famewall (%d on your wall there).', $res['added'], $res['total'] )
					: sprintf( 'Everything on your Famewall wall (%d) is already here.', $res['total'] ),
				60
			);
			$status = 'ok';
		}
		wp_safe_redirect( admin_url( 'edit.php?post_type=' . self::PT . '&page=sawa-t-settings&sawa_import=' . $status ) );
		exit;
	}

	public static function settings_page() {
		$s   = Sawa_Testimonials::settings();
		$opt = Sawa_Testimonials::OPT;
		$f   = function ( $k ) use ( $opt ) {
			return esc_attr( $opt . '[' . $k . ']' );
		};
		$fonts = array_combine( Sawa_Testimonials::FONTS, Sawa_Testimonials::FONTS );
		$fonts['inherit'] = "Use my website's font";
		global $wpdb;
		$remote = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key IN ('_sawa_avatar','_sawa_media') AND meta_value LIKE %s", '%' . $wpdb->esc_like( 'famewall.io/' ) . '%' ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
		?>
		<div class="wrap sawa-settings">
			<h1>Testimonials: settings &amp; import</h1>

			<div class="sawa-cards">
				<div class="sawa-card">
					<h2>Put it on your site</h2>
					<p>In Elementor, drag a <b>Shortcode</b> widget onto the page and paste one of these:</p>
					<table class="sawa-codes">
						<tr><td><code>[sawa_testimonials]</code></td><td>The full wall</td></tr>
						<tr><td><code>[sawa_testimonials featured="yes"]</code></td><td>Only testimonials marked ★ featured</td></tr>
						<tr><td><code>[sawa_testimonials limit="6"]</code></td><td>The 6 newest</td></tr>
						<tr><td><code>[sawa_review_form]</code></td><td>The review form for students (put it on a page like <b>/review</b>)</td></tr>
						<tr><td><code>[sawa_gift_form]</code></td><td>The gift page students go to after sending a review: they claim free Sawa App access (put it on a page like <b>/gift</b>, with the <b>Sawa: App page</b> template). Claims show in <b>Sawa Tracker → Access requests</b>.</td></tr>
					</table>
					<p class="description">The wall updates by itself: approve a review and it's on your site.</p>
				</div>

				<div class="sawa-card">
					<h2>Import from Famewall</h2>
					<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
						<?php wp_nonce_field( 'sawa_t_import' ); ?>
						<input type="hidden" name="action" value="sawa_t_import">
						<p>Adds every testimonial on your Famewall wall that isn't here yet. Safe to run again.</p>
						<p><label>Famewall wall name <input type="text" name="wall" value="<?php echo esc_attr( $s['famewallWall'] ); ?>"></label>
						<?php submit_button( 'Import from Famewall', 'primary', 'submit', false ); ?></p>
					</form>
					<hr>
					<p><b><?php echo (int) $remote; ?></b> photos and screenshots are still stored on Famewall's servers. Copy them to your media library so they keep working after you cancel Famewall.</p>
					<p><button type="button" class="button" id="sawa-localize" <?php disabled( 0, $remote ); ?>>Copy photos to my media library</button> <span id="sawa-localize-msg" class="description" aria-live="polite"></span></p>
				</div>
			</div>

			<form method="post" action="options.php">
				<?php settings_fields( 'sawa_t' ); ?>
				<h2>Wall</h2>
				<table class="form-table" role="presentation">
					<tr><th scope="row"><label for="s-title">Title</label></th><td><input id="s-title" class="regular-text" name="<?php echo $f( 'title' ); // phpcs:ignore ?>" value="<?php echo esc_attr( $s['title'] ); ?>"></td></tr>
					<tr><th scope="row"><label for="s-sub">Subtitle</label></th><td><input id="s-sub" class="regular-text" name="<?php echo $f( 'subtitle' ); // phpcs:ignore ?>" value="<?php echo esc_attr( $s['subtitle'] ); ?>"></td></tr>
					<tr><th scope="row"><label for="s-accent">Accent color</label></th><td><input id="s-accent" type="color" name="<?php echo $f( 'accent' ); // phpcs:ignore ?>" value="<?php echo esc_attr( $s['accent'] ); ?>"></td></tr>
					<tr><th scope="row"><label for="s-theme">Cards</label></th><td><?php echo self::select( $opt . '[theme]', array( 'dark' => 'Dark cards', 'light' => 'Light cards' ), $s['theme'], 'id="s-theme"' ); // phpcs:ignore ?></td></tr>
					<tr><th scope="row"><label for="s-font">Font</label></th><td><?php echo self::select( $opt . '[font]', $fonts, $s['font'], 'id="s-font"' ); // phpcs:ignore ?></td></tr>
					<tr><th scope="row"><label for="s-radius">Corner roundness</label></th><td><input id="s-radius" type="number" min="0" max="28" class="small-text" name="<?php echo $f( 'radius' ); // phpcs:ignore ?>" value="<?php echo (int) $s['radius']; ?>"> px</td></tr>
					<tr><th scope="row"><label for="s-cols">Max columns</label></th><td><?php echo self::select( $opt . '[maxColumns]', array( 1 => 1, 2 => 2, 3 => 3, 4 => 4 ), $s['maxColumns'], 'id="s-cols"' ); // phpcs:ignore ?></td></tr>
					<tr><th scope="row"><label for="s-init">Show at first</label></th><td><input id="s-init" type="number" min="1" max="500" class="small-text" name="<?php echo $f( 'initialCount' ); // phpcs:ignore ?>" value="<?php echo (int) $s['initialCount']; ?>"> then a button: <input class="regular-text" name="<?php echo $f( 'moreLabel' ); // phpcs:ignore ?>" value="<?php echo esc_attr( $s['moreLabel'] ); ?>" aria-label="Show more button text"></td></tr>
					<tr><th scope="row">Show</th><td>
						<?php
						$checks = array(
							'showSummary' => 'Average rating under the title',
							'showFilters' => 'Filter buttons by source',
							'showRatings' => 'Star ratings',
							'showSources' => 'Source icon next to names',
							'showDates'   => 'Dates',
						);
						foreach ( $checks as $k => $label ) {
							echo '<label><input type="checkbox" name="' . $f( $k ) . '" value="1" ' . checked( $s[ $k ], 1, false ) . '> ' . esc_html( $label ) . '</label><br>'; // phpcs:ignore
						}
						?>
					</td></tr>
				</table>

				<h2>Review form</h2>
				<table class="form-table" role="presentation">
					<tr><th scope="row"><label for="f-title">Title</label></th><td><input id="f-title" class="large-text" name="<?php echo $f( 'formTitle' ); // phpcs:ignore ?>" value="<?php echo esc_attr( $s['formTitle'] ); ?>"></td></tr>
					<tr><th scope="row"><label for="f-intro">Intro</label></th><td><textarea id="f-intro" class="large-text" rows="3" name="<?php echo $f( 'formIntro' ); // phpcs:ignore ?>"><?php echo esc_textarea( $s['formIntro'] ); ?></textarea></td></tr>
					<tr><th scope="row"><label for="f-consent">Permission checkbox</label></th><td><input id="f-consent" class="large-text" name="<?php echo $f( 'formConsent' ); // phpcs:ignore ?>" value="<?php echo esc_attr( $s['formConsent'] ); ?>"></td></tr>
					<tr><th scope="row"><label for="f-button">Button</label></th><td><input id="f-button" class="regular-text" name="<?php echo $f( 'formButton' ); // phpcs:ignore ?>" value="<?php echo esc_attr( $s['formButton'] ); ?>"></td></tr>
					<tr><th scope="row"><label for="f-thanks">Thank-you message</label></th><td><input id="f-thanks" class="large-text" name="<?php echo $f( 'formThanks' ); // phpcs:ignore ?>" value="<?php echo esc_attr( $s['formThanks'] ); ?>"></td></tr>
					<tr><th scope="row"><label for="f-examples">Example reviews</label></th><td><input id="f-examples" class="large-text" name="<?php echo $f( 'formExamples' ); // phpcs:ignore ?>" value="<?php echo esc_attr( $s['formExamples'] ); ?>"><p class="description">Names of students, separated by commas. The form shows the newest published review of each one as an example.</p></td></tr>
					<tr><th scope="row">Email me</th><td><label><input type="checkbox" name="<?php echo $f( 'notify' ); // phpcs:ignore ?>" value="1" <?php checked( $s['notify'], 1 ); ?>> Send an email to <?php echo esc_html( get_option( 'admin_email' ) ); ?> when a student sends a review</label></td></tr>
					<tr><th scope="row">Upload limit</th><td><p class="description">Your server accepts files up to <b><?php echo esc_html( size_format( wp_max_upload_size() ) ); ?></b>. Students with bigger videos are asked to paste a YouTube or Loom link instead.</p></td></tr>
				</table>
				<input type="hidden" name="<?php echo $f( 'famewallWall' ); // phpcs:ignore ?>" value="<?php echo esc_attr( $s['famewallWall'] ); ?>">
				<?php submit_button( 'Save settings' ); ?>
			</form>

			<h2>Preview</h2>
			<div class="sawa-preview-stage wide <?php echo esc_attr( $s['theme'] ); ?>"><?php echo Sawa_Testimonials::shortcode_wall( array( 'limit' => 6 ) ); // phpcs:ignore ?></div>
		</div>
		<?php
	}
}
