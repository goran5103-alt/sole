<?php if ( ! defined( 'ABSPATH' ) ) exit;
$tel   = sole_opt( 'telefon' );
$paras = preg_split( '/\R\s*\R/', trim( (string) sole_opt( 'f_kontakt' ) ) );
?>
<footer class="foot"><div class="wrap">
<div class="cols">
<div class="f-brand"><img src="<?php echo esc_url( sole_opt( 'logo' ) ); ?>" alt="<?php echo esc_attr( sole_opt( 'logo_alt' ) ); ?>"><p class="addr"><?php echo esc_html( sole_opt( 'adresa' ) ); ?></p><p><a class="tel" href="<?php echo esc_attr( sole_tel( $tel ) ); ?>"><?php echo esc_html( $tel ); ?></a></p></div>
<div><h4><?php echo esc_html( sole_opt( 'f_naslov1' ) ); ?></h4><ul><?php echo sole_footer_list( 'podnozje-1' ); ?></ul></div>
<div><h4><?php echo esc_html( sole_opt( 'f_naslov2' ) ); ?></h4><ul><?php echo sole_footer_list( 'podnozje-2' ); ?></ul></div>
<div class="f-contact"><h4><?php echo esc_html( sole_opt( 'f_naslov3' ) ); ?></h4><?php foreach ( $paras as $p ) { if ( '' !== trim( $p ) ) echo '<p>' . nl2br( esc_html( trim( $p ) ), false ) . '</p>'; } ?></div>
</div>
<div class="bottom"><?php echo esc_html( sole_opt( 'f_donji_tekst' ) ); ?></div>
</div></footer>
<div class="lb" id="lb"><button class="x" type="button">×</button><button class="pv" type="button">‹</button><img alt=""><button class="nx" type="button">›</button></div>
<?php wp_footer(); ?>
</body>
</html>
