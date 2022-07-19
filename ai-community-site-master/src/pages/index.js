import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import Community from '/docs/box-community.md';
import Blogs from '/docs/box-blogs.md';
import Events from '/docs/box-events.md';

//import blogFeed from '/blog/rss.xml'

const features = [
  {
    title: <>Community</>,
    //imageUrl: 'img/icon-community-white.svg',
    description: (
      <>
        <Community />
      </>
    ),
  },
  {
    title: <>Recent Blog Posts</>,
    //imageUrl: 'img/icon-blog-white.svg',
    description: (
      <>
        <Blogs />
      </>
    ),
  },
  {
    title: <>Upcoming AI Events</>,
    //imageUrl: 'img/icon-events-white.svg',
    description: (
      <>
        <Events />

      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('homebox col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="The gateway to everything AI at UHG.">

      <div className="announcement">
        <div className="announcementInner">
          What do you think of the new website? Send us your {' '}
          <Link to={useBaseUrl('https://forms.office.com/r/6QBbSScy6S')}>
            feedback
          </Link>
          .
        </div>
      </div>

      <header className={classnames('hero hero--primary', styles.heroBanner)}>


        <div className="container">

        <div className="row">
          <div className="col padding-top--lg padding-bottom--lg">
          <h1 className="hero__title">Transforming health&nbsp;care with <span>artificial intelligence</span></h1>
          <p className="hero__copy">The <b>AI FOR ALL</b> initiative brings together data scientists, engineers, technologists, and AI enthusiasts from across UHG to share their ideas, challenges, best practices, and preferred technologies.</p>
          <div className="herobuttons">



            <Link
              className={classnames(
                'button',
                styles.getStarted,
              )}
              to={useBaseUrl('/docs/about/about-index')}>
              Get started →
            </Link>


          </div>
          </div>

          <div className="col text--center home-video">
          <iframe id="kaltura_player" src="https://cdnapisec.kaltura.com/p/2297431/sp/229743100/embedIframeJs/uiconf_id/40040682/partner_id/2297431?iframeembed=true&playerId=kaltura_player&entry_id=1_wrrt46ry&flashvars[streamerType]=auto&amp;flashvars[localizationCode]=en&amp;flashvars[leadWithHTML5]=true&amp;flashvars[sideBarContainer.plugin]=true&amp;flashvars[sideBarContainer.position]=left&amp;flashvars[sideBarContainer.clickToClose]=true&amp;flashvars[chapters.plugin]=true&amp;flashvars[chapters.layout]=vertical&amp;flashvars[chapters.thumbnailRotator]=false&amp;flashvars[streamSelector.plugin]=true&amp;flashvars[EmbedPlayer.SpinnerTarget]=videoHolder&amp;flashvars[dualScreen.plugin]=true&amp;flashvars[hotspots.plugin]=1&amp;flashvars[Kaltura.addCrossoriginToIframe]=true&amp;&wid=1_oilz2g9j" width="430" height="315" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *" sandbox="allow-forms allow-same-origin allow-scripts allow-top-navigation allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation" frameborder="0" title="Kaltura Player"></iframe>
          </div>
          </div>
        </div>
      </header>

      <main>

        {features && features.length && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
