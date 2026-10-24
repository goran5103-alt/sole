<?php if ( ! defined( 'ABSPATH' ) ) exit;
/* Red kontakt bloka po vrsti sadržaja (ikonica): mejl, faks, radno vreme, telefon, inače adresa; prvi red velikim slovima je naslov. */
if ( ! function_exists( 'sole_fl_kind' ) ) {
function sole_fl_kind( $l ) {
	if ( false !== strpos( $l, '@' ) ) return 'mail';
	if ( preg_match( '/^fax\b/iu', $l ) ) return 'fax';
	if ( preg_match( '/ponedeljak|utorak|sreda|četvrtak|petak|subota|nedelja|\d{1,2}:\d{2}/iu', $l ) ) return 'time';
	if ( preg_match( '/^[+\d][\d\s,\/().-]{6,}$/u', $l ) ) return 'tel';
	return 'pin';
}
}
if ( ! function_exists( 'sole_foot_lines' ) ) {
function sole_foot_lines( $p ) {
	$ls = array_values( array_filter( array_map( 'trim', preg_split( '/\R/', $p ) ), 'strlen' ) );
	$out = array(); $prev = null;
	foreach ( $ls as $i => $l ) {
		$k = ( 0 === $i && count( $ls ) > 1 && mb_strtoupper( $l ) === $l && ! preg_match( '/\d/', $l ) ) ? 'ttl' : sole_fl_kind( $l );
		$out[] = '<span class="fl fl-' . $k . ( ( $prev === $k && 'ttl' !== $k ) ? ' fl-c' : '' ) . '">' . esc_html( $l ) . '</span>';
		$prev = $k;
	}
	return implode( '<br>', $out );
}
}
$tel   = sole_opt( 'telefon' );
$paras = preg_split( '/\R\s*\R/', trim( (string) sole_opt( 'f_kontakt' ) ) );
?>
<footer class="foot"><div class="wrap">
<div class="cols">
<div class="f-brand"><img src="<?php echo esc_url( sole_opt( 'logo' ) ); ?>" alt="<?php echo esc_attr( sole_opt( 'logo_alt' ) ); ?>"><p class="addr"><?php echo esc_html( sole_opt( 'adresa' ) ); ?></p><p><a class="tel" href="<?php echo esc_attr( sole_tel( $tel ) ); ?>"><?php echo esc_html( $tel ); ?></a></p></div>
<div><h4><?php echo esc_html( sole_opt( 'f_naslov1' ) ); ?></h4><ul><?php echo sole_footer_list( 'podnozje-1' ); ?></ul></div>
<div><h4><?php echo esc_html( sole_opt( 'f_naslov2' ) ); ?></h4><ul><?php echo sole_footer_list( 'podnozje-2' ); ?></ul></div>
<div class="f-contact"><h4><?php echo esc_html( sole_opt( 'f_naslov3' ) ); ?></h4><?php foreach ( $paras as $p ) { if ( '' !== trim( $p ) ) echo '<p class="fb">' . sole_foot_lines( trim( $p ) ) . '</p>'; } ?></div>
</div>
<div class="bottom"><?php echo esc_html( sole_opt( 'f_donji_tekst' ) ); ?></div>
</div></footer>
<div class="lb" id="lb"><button class="x" type="button">×</button><button class="pv" type="button">‹</button><img alt=""><button class="nx" type="button">›</button></div>
<?php wp_footer(); ?>
</body>
</html>
