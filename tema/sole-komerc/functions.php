<?php
/**
 * Sole Komerc — tema bez page buildera.
 * Tekst i slike strana: ITX dodatak. Telefon, adresa, logo, uvod, kontakt blok, podnožje, praćenje pregleda: Opcije teme.
 * Glavni meni, mega meni UGALJ i meniji u podnožju: Izgled → Meniji.
 */
if ( ! defined( 'ABSPATH' ) ) exit;

define( 'SOLE_VER', '1.1.0' );

require_once get_template_directory() . '/inc/opcije.php';
require_once get_template_directory() . '/inc/meniji.php';
require_once get_template_directory() . '/inc/slotovi.php';

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	register_nav_menus( array(
		'glavni'     => 'Glavni meni (sa mega menijem)',
		'podnozje-1' => 'Podnožje — prva kolona',
		'podnozje-2' => 'Podnožje — druga kolona',
	) );
} );

add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'sole-fonts', 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap', array(), null );
	wp_enqueue_style( 'sole-style', get_stylesheet_uri(), array( 'sole-fonts' ), SOLE_VER );
	wp_enqueue_script( 'sole-site', get_template_directory_uri() . '/assets/site.js', array(), SOLE_VER, true );

	if ( is_front_page() && sole_opt( 'uvod_ukljucen' ) ) {
		wp_enqueue_style( 'sole-uvod', get_template_directory_uri() . '/assets/uvod.css', array( 'sole-style' ), SOLE_VER );
		$three = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
		wp_enqueue_script( 'sole-three', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', array(), '0.128.0', true );
		wp_enqueue_script( 'sole-three-copy', $three . 'shaders/CopyShader.js', array( 'sole-three' ), '0.128.0', true );
		wp_enqueue_script( 'sole-three-lum', $three . 'shaders/LuminosityHighPassShader.js', array( 'sole-three' ), '0.128.0', true );
		wp_enqueue_script( 'sole-three-comp', $three . 'postprocessing/EffectComposer.js', array( 'sole-three-copy' ), '0.128.0', true );
		wp_enqueue_script( 'sole-three-render', $three . 'postprocessing/RenderPass.js', array( 'sole-three-comp' ), '0.128.0', true );
		wp_enqueue_script( 'sole-three-shader', $three . 'postprocessing/ShaderPass.js', array( 'sole-three-comp' ), '0.128.0', true );
		wp_enqueue_script( 'sole-three-bloom', $three . 'postprocessing/UnrealBloomPass.js', array( 'sole-three-lum', 'sole-three-render', 'sole-three-shader' ), '0.128.0', true );
		wp_enqueue_script( 'sole-uvod', get_template_directory_uri() . '/assets/uvod.js', array( 'sole-three-bloom' ), SOLE_VER, true );
	}
}, 20 );

/* Sadržaj strana je ručno kođen HTML: bez automatskih pasusa i tipografskih zamena, tekst ostaje onakav kakav je upisan */
add_action( 'init', function () {
	remove_filter( 'the_content', 'wpautop' );
	remove_filter( 'the_content', 'wptexturize' );
	remove_filter( 'the_content', 'convert_smilies' );
	add_filter( 'wpcf7_autop_or_not', '__return_false' );
} );

/* WordPress daje body-ju klasu 'page', a ista klasa u CSS-u teme označava sekciju sadržaja */
add_filter( 'body_class', function ( $c ) {
	return array_values( array_diff( $c, array( 'page' ) ) );
} );

/* Tehnički podaci u <head> koje sajt ne koristi (verzija WordPressa, RSD, oEmbed, REST linkovi) */
add_action( 'init', function () {
	remove_action( 'wp_head', 'wp_generator' );
	remove_action( 'wp_head', 'rsd_link' );
	remove_action( 'wp_head', 'wlwmanifest_link' );
	remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
	remove_action( 'wp_head', 'rest_output_link_wp_head' );
} );

/* Bez nepotrebnih stilova koje WordPress dodaje */
add_action( 'wp_enqueue_scripts', function () {
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'global-styles' );
	wp_dequeue_style( 'classic-theme-styles' );
}, 100 );
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

/* Sadržaj strana crta tema, ne page builder: stilovi i skripte Elementora (i njegovi fontovi) se ne učitavaju.
   Elementor ostaje instaliran dok se ne potvrdi da nijedna strana više ne zavisi od njega. */
function sole_bez_buildera() {
	foreach ( array( wp_styles(), wp_scripts() ) as $q ) {
		foreach ( $q->registered as $h => $o ) {
			$src = is_string( $o->src ) ? $o->src : '';
			if ( false !== strpos( $src, '/plugins/elementor' ) || false !== strpos( $src, '/uploads/elementor/' ) || 0 === strpos( $h, 'elementor' ) || 'google-fonts-1' === $h || 'swiper' === $h || 'e-swiper' === $h ) {
				wp_dequeue_style( $h );
				wp_dequeue_script( $h );
			}
		}
	}
}
add_action( 'wp_enqueue_scripts', 'sole_bez_buildera', 9999 );
add_action( 'wp_print_styles', 'sole_bez_buildera', 9999 );
add_action( 'wp_print_scripts', 'sole_bez_buildera', 9999 );

/* Praćenje pregleda (preview tracker): svaka strana jednom pozove centralni track.php sa imenom projekta.
   track.php i dashboard.php stoje na serveru izradasajtovasajta.com, ne u temi. Uključuje se u Opcijama teme. */
add_action( 'wp_footer', function () {
	if ( ! sole_opt( 'tracker_ukljucen' ) ) return;
	$url = esc_url_raw( sole_opt( 'tracker_url' ) );
	$ime = preg_replace( '/[^a-zA-Z0-9_\-]/', '', (string) sole_opt( 'tracker_ime' ) );
	if ( '' === $url || '' === $ime ) return;
	echo '<script>fetch(' . wp_json_encode( add_query_arg( 'site', $ime, $url ) ) . ',{mode:"no-cors",keepalive:true,cache:"no-store"}).catch(function(){});</script>' . "\n";
}, 99 );
