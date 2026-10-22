<?php
/**
 * Widget: hero sa tekst-maskom (prva sekcija naslovne).
 */
if ( ! defined( 'ABSPATH' ) ) exit;

class Divljina_Widget_Hero extends \Elementor\Widget_Base {

	public function get_name() { return 'divljina-hero'; }
	public function get_title() { return __( 'Divljina — hero', 'divljina' ); }
	public function get_icon() { return 'eicon-banner'; }
	public function get_categories() { return array( 'divljina' ); }

	protected function register_controls() {

		$this->start_controls_section( 'sadrzaj', array( 'label' => __( 'Sadržaj', 'divljina' ) ) );

		$this->add_control( 'slika', array(
			'label' => __( 'Pozadinska slika', 'divljina' ),
			'type'  => \Elementor\Controls_Manager::MEDIA,
		) );

		$this->add_control( 'rec_1', array(
			'label'       => __( 'Reč u maski — prvi red', 'divljina' ),
			'type'        => \Elementor\Controls_Manager::TEXT,
			'default'     => 'divljina',
			'description' => __( 'Tekst kroz koji se vidi slika dok se skroluje.', 'divljina' ),
		) );
		$this->add_control( 'rec_2', array(
			'label'   => __( 'Reč u maski — drugi red', 'divljina' ),
			'type'    => \Elementor\Controls_Manager::TEXT,
			'default' => 'zove',
		) );

		$this->add_control( 'naslov_1', array(
			'label'   => __( 'Naslov — prvi red', 'divljina' ),
			'type'    => \Elementor\Controls_Manager::TEXT,
			'default' => 'spremni za',
		) );
		$this->add_control( 'naslov_2', array(
			'label'   => __( 'Naslov — drugi red', 'divljina' ),
			'type'    => \Elementor\Controls_Manager::TEXT,
			'default' => 'prirodu',
		) );

		$this->add_control( 'dugme_1', array(
			'label'   => __( 'Prvo dugme — tekst', 'divljina' ),
			'type'    => \Elementor\Controls_Manager::TEXT,
		) );
		$this->add_control( 'dugme_1_url', array(
			'label'       => __( 'Prvo dugme — adresa', 'divljina' ),
			'type'        => \Elementor\Controls_Manager::URL,
			'label_block' => true,
		) );
		$this->add_control( 'dugme_2', array(
			'label' => __( 'Drugo dugme — tekst', 'divljina' ),
			'type'  => \Elementor\Controls_Manager::TEXT,
		) );
		$this->add_control( 'dugme_2_url', array(
			'label'       => __( 'Drugo dugme — adresa', 'divljina' ),
			'type'        => \Elementor\Controls_Manager::URL,
			'label_block' => true,
		) );

		$this->end_controls_section();
	}

	protected function render() {
		$n = $this->get_settings_for_display();
		$slika = ! empty( $n['slika']['url'] ) ? $n['slika']['url'] : '';
		$r1 = $n['rec_1'];
		$r2 = $n['rec_2'];
		?>
		<section class="hero-c" id="heroC">
			<div class="hc-stick">
				<?php /* Ovo je najveća slika na naslovnoj i prvo što kupac vidi, pa
				         se traži odmah i sa prednošću — ne čeka red iza skripti. */ ?>
				<div class="hc-img"><img id="hcPic" src="<?php echo esc_url( $slika ); ?>" alt="" fetchpriority="high" decoding="async"></div>
				<div class="hc-plain"><div class="topo"><svg><rect width="100%" height="100%" filter="url(#topo)"/></svg></div><div class="glow"></div><div class="mist"></div><div class="shade"></div></div>
				<svg class="hc-mask" id="hcMask" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1600 900">
					<defs>
						<mask id="hcCut" maskUnits="userSpaceOnUse" x="-6000" y="-6000" width="13600" height="12900">
							<rect x="-6000" y="-6000" width="13600" height="12900" fill="#fff"/>
							<g id="hcWord">
								<text id="hcT1" x="800" y="430" text-anchor="middle" font-size="250" fill="#000"><?php echo esc_html( $r1 ); ?></text>
								<text x="800" y="640" text-anchor="middle" font-size="190" fill="#000"><?php echo esc_html( $r2 ); ?></text>
							</g>
						</mask>
					</defs>
					<rect id="hcCover" x="-6000" y="-6000" width="13600" height="12900" fill="#0d120e" mask="url(#hcCut)"/>
				</svg>
				<div class="hc-hint"><i></i></div>
				<div class="hc-copy">
					<div class="wrap">
						<h1><span class="l1"><?php echo esc_html( $n['naslov_1'] ); ?></span><span class="l2"><?php echo esc_html( $n['naslov_2'] ); ?></span></h1>
						<?php if ( $n['dugme_1'] || $n['dugme_2'] ) : ?>
						<div class="ha-cta">
							<?php if ( $n['dugme_1'] ) : ?>
							<a class="btn" href="<?php echo esc_url( isset( $n['dugme_1_url']['url'] ) ? $n['dugme_1_url']['url'] : '' ); ?>"><?php echo esc_html( $n['dugme_1'] ); ?> <?php divljina_ikona( 'i-arrow' ); ?></a>
							<?php endif; ?>
							<?php if ( $n['dugme_2'] ) : ?>
							<a class="btn-ghost" href="<?php echo esc_url( isset( $n['dugme_2_url']['url'] ) ? $n['dugme_2_url']['url'] : '' ); ?>"><?php echo esc_html( $n['dugme_2'] ); ?> <?php divljina_ikona( 'i-down' ); ?></a>
							<?php endif; ?>
						</div>
						<?php endif; ?>
					</div>
				</div>
			</div>
		</section>
		<?php
	}
}
