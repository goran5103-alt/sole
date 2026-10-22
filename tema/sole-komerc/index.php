<?php
if ( ! defined( 'ABSPATH' ) ) exit;
get_header();

/* Uvod naslovne (animacija žara) — izvan <main>, jer ITX uređivač radi samo nad sadržajem strane */
if ( is_front_page() && sole_opt( 'uvod_ukljucen' ) ) :
?>
<section id="intro"><div class="stick" id="stick">
<div class="hero" id="hero"><canvas id="gl"></canvas><div class="veil"></div>
<div class="copy"><div class="in"><h1><span class="a"><?php echo esc_html( sole_opt( 'uvod_red1' ) ); ?></span> <span class="b"><?php echo esc_html( sole_opt( 'uvod_red2' ) ); ?></span> <span class="c"><?php echo esc_html( sole_opt( 'uvod_red3' ) ); ?></span></h1></div></div>
</div>
<svg class="cover" id="hcMask" viewBox="0 0 1600 900" aria-hidden="true"><defs>
<mask id="hcCut" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="40000" height="40000">
<rect x="-20000" y="-20000" width="40000" height="40000" fill="#fff"></rect>
<g id="hcWord"><text id="hcT1" x="800" y="430" text-anchor="middle" font-size="300" fill="#000"><?php echo esc_html( sole_opt( 'uvod_rec1' ) ); ?></text><text id="hcT2" x="800" y="660" text-anchor="middle" font-size="240" fill="#000"><?php echo esc_html( sole_opt( 'uvod_rec2' ) ); ?></text></g>
</mask>
<filter id="hcRing" x="-4%" y="-8%" width="108%" height="116%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="d"></feMorphology><feComposite in="d" in2="SourceAlpha" operator="out" result="ring"></feComposite><feFlood flood-color="#f5c518" flood-opacity=".75"></feFlood><feComposite in2="ring" operator="in"></feComposite></filter></defs>
<rect id="hcCover" x="-20000" y="-20000" width="40000" height="40000" fill="#060403" fill-opacity=".8" mask="url(#hcCut)"></rect>
<g id="hcLine" fill="#fff" filter="url(#hcRing)"><text id="hcL1" x="800" y="430" text-anchor="middle" font-size="300"><?php echo esc_html( sole_opt( 'uvod_rec1' ) ); ?></text><text id="hcL2" x="800" y="660" text-anchor="middle" font-size="240"><?php echo esc_html( sole_opt( 'uvod_rec2' ) ); ?></text></g>
</svg>
<div class="hint"><i></i></div>
</div></section>
<?php endif; ?>
<main>
<?php
while ( have_posts() ) {
	the_post();
	echo sole_sadrzaj( get_the_ID() ); // phpcs:ignore WordPress.Security.EscapeOutput -- sadržaj strane, urednik ga unosi
}
?>
</main>
<?php get_footer();
