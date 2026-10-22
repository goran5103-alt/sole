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

function sole_main_nav() {
	$cur = get_queried_object_id();
	$out = '';
	foreach ( sole_menu_tree( 'glavni' ) as $it ) {
		$on = sole_item_on( $it, $cur );
		if ( $it->kids ) {
			$cols = '';
			foreach ( $it->kids as $g ) {
				$sub = '';
				foreach ( $g->kids as $c ) $sub .= '<li>' . sole_a( $c ) . '</li>';
				$cols .= '<div class="grp">' . sole_a( $g ) . ( $sub ? '<ul>' . $sub . '</ul>' : '' ) . '</div>';
			}
			$out .= '<li class="has-mega' . ( $on ? ' on' : '' ) . '"><a href="' . esc_url( $it->url ) . '">' . esc_html( $it->title ) . '<i class="caret"></i></a><div class="mega">' . $cols . '</div></li>';
		} else {
			$out .= '<li' . ( $on ? ' class="on"' : '' ) . '>' . sole_a( $it ) . '</li>';
		}
	}
	return $out;
}

function sole_drawer_nav() {
	$out = '';
	foreach ( sole_menu_tree( 'glavni' ) as $it ) {
		if ( $it->kids ) {
			$sub = '';
			foreach ( $it->kids as $g ) {
				$inner = '';
				foreach ( $g->kids as $c ) $inner .= '<li>' . sole_a( $c ) . '</li>';
				$sub .= '<li>' . sole_a( $g ) . ( $inner ? '<ul>' . $inner . '</ul>' : '' ) . '</li>';
			}
			$out .= '<li>' . sole_a( $it ) . '<ul class="d-sub">' . $sub . '</ul></li>';
		} else {
			$out .= '<li>' . sole_a( $it ) . '</li>';
		}
	}
	return $out;
}

function sole_footer_list( $loc ) {
	$out = '';
	foreach ( sole_menu_tree( $loc ) as $it ) $out .= '<li>' . sole_a( $it ) . '</li>';
	return $out;
}
