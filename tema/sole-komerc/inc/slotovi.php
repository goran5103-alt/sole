<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/* Delovi strane koje popunjava tema (iz Opcija teme i Contact Form 7), ne ITX uređivač.
   U sadržaju strane stoji prazan element sa atributom data-itx-slot. */
function sole_slot_kontakt() {
	return '<h4>' . esc_html( sole_opt( 'kb_naslov' ) ) . '</h4>'
		. '<p class="addr">' . esc_html( sole_opt( 'kb_adresa' ) ) . '</p>'
		. '<p><a class="tel" href="' . esc_attr( sole_tel( sole_opt( 'kb_telefon' ) ) ) . '">' . esc_html( sole_opt( 'kb_telefon' ) ) . '</a></p>'
		. '<p><a class="more" href="' . esc_url( sole_opt( 'kb_link_url' ) ) . '">' . esc_html( sole_opt( 'kb_link_tekst' ) ) . '</a></p>';
}

function sole_slot_cf7() {
	$id = absint( sole_opt( 'cf7_id' ) );
	return $id ? do_shortcode( '[contact-form-7 id="' . $id . '"]' ) : '';
}

function sole_sadrzaj( $post_id ) {
	$c = (string) get_post_field( 'post_content', $post_id );
	$c = preg_replace_callback(
		'#(<div\b[^>]*\bdata-itx-slot="(kontakt|cf7)"[^>]*>)\s*(</div>)#',
		function ( $m ) {
			return $m[1] . ( 'kontakt' === $m[2] ? sole_slot_kontakt() : sole_slot_cf7() ) . $m[3];
		},
		$c
	);
	return do_shortcode( $c );
}
