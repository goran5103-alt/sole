<?php if ( ! defined( 'ABSPATH' ) ) exit;
$tel  = sole_opt( 'telefon' );
$logo = sole_opt( 'logo' );
$alt  = sole_opt( 'logo_alt' );
$svg  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>';
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<script>document.documentElement.className+=' js'</script>
<div class="topbar"><div class="wrap"><div class="tb-tag"><?php echo esc_html( sole_opt( 'topbar_tekst' ) ); ?></div></div></div>
<header class="site-head" id="head"><div class="wrap">
<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>"><img src="<?php echo esc_url( $logo ); ?>" alt="<?php echo esc_attr( $alt ); ?>" width="190" height="46"></a>
<nav class="nav"><ul><?php echo sole_main_nav(); ?></ul></nav>
<a class="head-call" href="<?php echo esc_attr( sole_tel( $tel ) ); ?>"><?php echo $svg; ?><?php echo esc_html( $tel ); ?></a>
<button class="burger" id="burger" type="button" aria-expanded="false"><span></span></button>
</div></header>
<div class="drawer" id="drawer"><div class="panel">
<div class="d-top"><img src="<?php echo esc_url( $logo ); ?>" alt="<?php echo esc_attr( $alt ); ?>"><button class="close" type="button">×</button></div>
<ul class="d-main"><?php echo sole_drawer_nav(); ?></ul>
<a class="d-call" href="<?php echo esc_attr( sole_tel( $tel ) ); ?>"><?php echo esc_html( $tel ); ?></a>
</div></div>
