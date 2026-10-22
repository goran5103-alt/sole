<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/* Stablo stavki WordPress menija za dati položaj */
function sole_menu_tree( $loc ) {
	$locs = get_nav_menu_locations();
	if ( empty( $locs[ $loc ] ) ) return array();
	$items = wp_get_nav_menu_items( $locs[ $loc ] );
	if ( ! $items ) return array();
	$by = array();
	$tree = array();
	foreach ( $items as $it ) { $it->kids = array(); $by[ $it->ID ] = $it; }
	foreach ( $items as $it ) {
		if ( $it->menu_item_parent && isset( $by[ $it->menu_item_parent ] ) ) $by[ $it->menu_item_parent ]->kids[] = $it;
		else $tree[] = $it;
	}
	return $tree;
}

function sole_item_on( $it, $cur ) {
	if ( 'page' === $it->object && (int) $it->object_id === (int) $cur ) return true;
	foreach ( $it->kids as $k ) if ( sole_item_on( $k, $cur ) ) return true;
	return false;
}

function sole_tel( $p ) { return 'tel:' . preg_replace( '/[^\d+]/', '', $p ); }

function sole_a( $it ) {
	return '<a href="' . esc_url( $it->url ) . '">' . esc_html( $it->title ) . '</a>';
}

/* Prva slika strane (pozadina banera ili slika u sadržaju) — za slike grupa u mega meniju */
function sole_stranica_slika( $post_id ) {
	static $cache = array();
	$post_id = (int) $post_id;
	if ( ! isset( $cache[ $post_id ] ) ) {
		$c = (string) get_post_field( 'post_content', $post_id );
		if ( preg_match( '#url\(\s*[\'"]?([^\'")\s]+)#', $c, $m ) || preg_match( '#<img[^>]+src="([^"]+)"#', $c, $m ) ) $cache[ $post_id ] = $m[1];
		else $cache[ $post_id ] = '';
	}
	return $cache[ $post_id ];
}

/* Mega meni: levo grupe, desno podstavke i slika grupe */
function sole_mega( $it, $cur ) {
	$ids = array();
	foreach ( $it->kids as $g ) $ids[] = (int) $g->object_id;
	if ( $ids ) _prime_post_caches( $ids, false, false );
	$rows = '';
	foreach ( $it->kids as $g ) {
		$has  = ! empty( $g->kids );
		$img  = sole_stranica_slika( $g->object_id );
		$kids = '';
		foreach ( $g->kids as $c ) $kids .= '<li>' . sole_a( $c ) . '</li>';
		$pic  = $img ? '<a class="pic" href="' . esc_url( $g->url ) . '" tabindex="-1" aria-hidden="true"><img src="' . esc_url( $img ) . '" alt="" loading="lazy" decoding="async"></a>' : '';
		$pane = '<div class="pane' . ( $has ? '' : ' leaf' ) . '"><div class="pcol"><a class="ph" href="' . esc_url( $g->url ) . '">' . esc_html( $g->title ) . '</a>'
			. ( $has ? '<ul class="kids' . ( count( $g->kids ) > 5 ? ' two' : '' ) . '">' . $kids . '</ul>' : '' ) . '</div>' . $pic . '</div>';
		$cls  = 'grp' . ( $has ? ' has-kids' : '' ) . ( sole_item_on( $g, $cur ) ? ' on' : '' );
		$rows .= '<li class="' . $cls . '"><a class="g" href="' . esc_url( $g->url ) . '">' . esc_html( $g->title ) . '</a>' . $pane . '</li>';
	}
	return '<div class="mega"><div class="wrap mega-in"><ul class="rail">' . $rows . '</ul></div></div>';
}

function sole_main_nav() {
	$cur = get_queried_object_id();
	$out = '';
	foreach ( sole_menu_tree( 'glavni' ) as $it ) {
		$on = sole_item_on( $it, $cur );
		if ( $it->kids ) {
			$out .= '<li class="has-mega' . ( $on ? ' on' : '' ) . '"><a href="' . esc_url( $it->url ) . '">' . esc_html( $it->title ) . '<i class="caret"></i></a>' . sole_mega( $it, $cur ) . '</li>';
		} else {
			$out .= '<li' . ( $on ? ' class="on"' : '' ) . '>' . sole_a( $it ) . '</li>';
		}
	}
	return $out;
}

function sole_toggle( $id, $open ) {
	return '<button class="tg" type="button" aria-expanded="' . ( $open ? 'true' : 'false' ) . '" aria-labelledby="' . esc_attr( $id ) . '"></button>';
}

/* Mobilni meni: isti redosled i nazivi kao mega meni, grupe se otvaraju strelicom */
function sole_drawer_nav() {
	$cur = get_queried_object_id();
	$n   = 0;
	$out = '';
	foreach ( sole_menu_tree( 'glavni' ) as $it ) {
		if ( $it->kids ) {
			$sub = '';
			foreach ( $it->kids as $g ) {
				if ( $g->kids ) {
					$n++;
					$gid = 'dl' . $n;
					$gop = sole_item_on( $g, $cur );
					$inner = '';
					foreach ( $g->kids as $c ) $inner .= '<li>' . sole_a( $c ) . '</li>';
					$sub .= '<li class="has-sub' . ( $gop ? ' open' : '' ) . '"><div class="row"><a id="' . $gid . '" href="' . esc_url( $g->url ) . '">' . esc_html( $g->title ) . '</a>' . sole_toggle( $gid, $gop ) . '</div><ul class="d-kids">' . $inner . '</ul></li>';
				} else {
					$sub .= '<li><div class="row">' . sole_a( $g ) . '</div></li>';
				}
			}
			$n++;
			$uid = 'dl' . $n;
			$uop = sole_item_on( $it, $cur );
			$out .= '<li class="has-sub' . ( $uop ? ' open' : '' ) . '"><div class="row"><a id="' . $uid . '" href="' . esc_url( $it->url ) . '">' . esc_html( $it->title ) . '</a>' . sole_toggle( $uid, $uop ) . '</div><ul class="d-sub">' . $sub . '</ul></li>';
		} else {
			$out .= '<li><div class="row">' . sole_a( $it ) . '</div></li>';
		}
	}
	return $out;
}

function sole_footer_list( $loc ) {
	$out = '';
	foreach ( sole_menu_tree( $loc ) as $it ) $out .= '<li>' . sole_a( $it ) . '</li>';
	return $out;
}
