<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/* Početne vrednosti = tekst sa originalnog sajta. Prave vrednosti čuvaju se u bazi (Opcije teme). */
function sole_defaults() {
	return array(
		'topbar_tekst'     => 'DOBRODOŠLI NA PREZENTACIJU PREDUZEĆA SOLE KOMERC D.O.O. BEOGRAD',
		'telefon'          => '+381 11 3617 289',
		'adresa'           => 'Maršala Tita 225, 11272 Dobanovci',
		'logo'             => '/wp-content/uploads/2024/12/logon-1.png',
		'logo_alt'         => 'SOLE KOMERC',
		'uvod_ukljucen'    => 1,
		'uvod_rec1'        => 'SOLE',
		'uvod_rec2'        => 'KOMERC',
		'uvod_red1'        => 'DOBRODOŠLI NA PREZENTACIJU PREDUZEĆA',
		'uvod_red2'        => 'SOLE KOMERC',
		'uvod_red3'        => 'D.O.O. BEOGRAD',
		'kb_naslov'        => 'KONTAKT',
		'kb_adresa'        => 'Maršala Tita 225, 11272 Dobanovci',
		'kb_telefon'       => '+381 11 3617 289',
		'kb_link_tekst'    => 'KONTAKT',
		'kb_link_url'      => '/kontakt/',
		'cf7_id'           => '2249',
		'f_naslov1'        => 'O NAMA',
		'f_naslov2'        => 'UGALJ',
		'f_naslov3'        => 'KONTAKT',
		'f_kontakt'        => '',
		'f_donji_tekst'    => 'DOBRODOŠLI NA PREZENTACIJU PREDUZEĆA SOLE KOMERC D.O.O. BEOGRAD',
		'tracker_ukljucen' => 0,
	);
}

function sole_opt( $k ) {
	static $o = null;
	if ( null === $o ) {
		$o = wp_parse_args( (array) get_option( 'sole_opts', array() ), sole_defaults() );
	}
	return isset( $o[ $k ] ) ? $o[ $k ] : '';
}

function sole_fields() {
	// [ ključ, naslov, vrsta, pomoć ]
	return array(
		'Gornja traka i kontakt podaci' => array(
			array( 'topbar_tekst', 'Tekst gornje trake', 'text', '' ),
			array( 'telefon', 'Telefon', 'text', 'Prikazuje se u gornjoj traci, zaglavlju i podnožju.' ),
			array( 'adresa', 'Adresa', 'text', 'Prikazuje se u podnožju.' ),
		),
		'Logo' => array(
			array( 'logo', 'Logo', 'media', 'Prikazuje se u zaglavlju, mobilnom meniju i podnožju.' ),
			array( 'logo_alt', 'Opis logoa (alt)', 'text', '' ),
		),
		'Uvod naslovne strane' => array(
			array( 'uvod_ukljucen', 'Prikaži uvod (animacija žara)', 'check', 'Isključeno: naslovna odmah počinje tekstom.' ),
			array( 'uvod_rec1', 'Velika reč — prvi red', 'text', 'Npr. SOLE' ),
			array( 'uvod_rec2', 'Velika reč — drugi red', 'text', 'Npr. KOMERC' ),
			array( 'uvod_red1', 'Naslov — prvi red', 'text', '' ),
			array( 'uvod_red2', 'Naslov — drugi red', 'text', '' ),
			array( 'uvod_red3', 'Naslov — treći red', 'text', '' ),
		),
		'Kontakt blok u bočnoj koloni' => array(
			array( 'kb_naslov', 'Naslov', 'text', '' ),
			array( 'kb_adresa', 'Adresa', 'text', '' ),
			array( 'kb_telefon', 'Telefon', 'text', '' ),
			array( 'kb_link_tekst', 'Tekst linka', 'text', '' ),
			array( 'kb_link_url', 'Adresa linka', 'text', 'Npr. /kontakt/' ),
			array( 'cf7_id', 'ID Contact Form 7 obrasca', 'text', 'Obrazac na strani Kontakt.' ),
		),
		'Podnožje' => array(
			array( 'f_naslov1', 'Naslov prve kolone', 'text', 'Meni: Izgled → Meniji → Podnožje — prva kolona.' ),
			array( 'f_naslov2', 'Naslov druge kolone', 'text', 'Meni: Podnožje — druga kolona.' ),
			array( 'f_naslov3', 'Naslov treće kolone', 'text', '' ),
			array( 'f_kontakt', 'Tekst treće kolone', 'textarea', 'Pasusi se odvajaju praznim redom, a novi red unutar pasusa je običan Enter.' ),
			array( 'f_donji_tekst', 'Tekst donje trake', 'text', '' ),
		),
		'Praćenje pregleda' => array(
			array( 'tracker_ukljucen', 'Uključi praćenje pregleda (preview tracker)', 'check', '' ),
		),
	);
}

add_action( 'admin_menu', function () {
	add_theme_page( 'Opcije teme', 'Opcije teme', 'manage_options', 'sole-opcije', 'sole_opcije_ekran' );
} );

add_action( 'admin_init', function () {
	register_setting( 'sole_opts_grupa', 'sole_opts', array( 'sanitize_callback' => 'sole_sanitize' ) );
} );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
	if ( 'appearance_page_sole-opcije' === $hook ) {
		wp_enqueue_media();
	}
} );

function sole_sanitize( $in ) {
	$out = array();
	foreach ( sole_fields() as $polja ) {
		foreach ( $polja as $p ) {
			list( $k, , $t ) = $p;
			$v = isset( $in[ $k ] ) ? wp_unslash( $in[ $k ] ) : '';
			if ( 'check' === $t ) $out[ $k ] = empty( $in[ $k ] ) ? 0 : 1;
			elseif ( 'textarea' === $t ) $out[ $k ] = sanitize_textarea_field( $v );
			else $out[ $k ] = sanitize_text_field( $v );
		}
	}
	return $out;
}

function sole_opcije_ekran() {
	?>
	<div class="wrap">
		<h1>Opcije teme</h1>
		<form method="post" action="options.php">
			<?php settings_fields( 'sole_opts_grupa' ); ?>
			<?php foreach ( sole_fields() as $naslov => $polja ) : ?>
				<h2><?php echo esc_html( $naslov ); ?></h2>
				<table class="form-table" role="presentation">
				<?php foreach ( $polja as $p ) : list( $k, $lab, $t, $help ) = $p; $v = sole_opt( $k ); $n = 'sole_opts[' . $k . ']'; ?>
					<tr>
						<th scope="row"><label for="o_<?php echo esc_attr( $k ); ?>"><?php echo esc_html( $lab ); ?></label></th>
						<td>
						<?php if ( 'check' === $t ) : ?>
							<input type="checkbox" id="o_<?php echo esc_attr( $k ); ?>" name="<?php echo esc_attr( $n ); ?>" value="1" <?php checked( $v, 1 ); ?>>
						<?php elseif ( 'textarea' === $t ) : ?>
							<textarea id="o_<?php echo esc_attr( $k ); ?>" name="<?php echo esc_attr( $n ); ?>" rows="8" class="large-text"><?php echo esc_textarea( $v ); ?></textarea>
						<?php elseif ( 'media' === $t ) : ?>
							<input type="text" id="o_<?php echo esc_attr( $k ); ?>" name="<?php echo esc_attr( $n ); ?>" value="<?php echo esc_attr( $v ); ?>" class="regular-text">
							<button type="button" class="button sole-media" data-target="o_<?php echo esc_attr( $k ); ?>">Izaberi iz medijateke</button>
						<?php else : ?>
							<input type="text" id="o_<?php echo esc_attr( $k ); ?>" name="<?php echo esc_attr( $n ); ?>" value="<?php echo esc_attr( $v ); ?>" class="large-text">
						<?php endif; ?>
						<?php if ( $help ) : ?><p class="description"><?php echo esc_html( $help ); ?></p><?php endif; ?>
						</td>
					</tr>
				<?php endforeach; ?>
				</table>
			<?php endforeach; ?>
			<?php submit_button(); ?>
		</form>
	</div>
	<script>
	document.querySelectorAll('.sole-media').forEach(function (b) {
		b.addEventListener('click', function () {
			var f = wp.media({ title: 'Izaberite logo', button: { text: 'Upotrebi' }, library: { type: 'image' }, multiple: false });
			f.on('select', function () {
				document.getElementById(b.dataset.target).value = f.state().get('selection').first().toJSON().url;
			});
			f.open();
		});
	});
	</script>
	<?php
}
