import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

/** @type {Array<{ date: string; formattedDate: string; title: string; permalink: string; }>} */
const allPosts = ((ctx) => {
  const keys = ctx.keys();
  const values = keys.map(ctx);
  return keys.reduce((blogposts, filename, i) => {
    const module = values[i];
    // console.log(module)
    const { date, formattedDate, title, permalink } = module.metadata;
    return [
      ...blogposts,
      {
        // filename,
        date,
        formattedDate,
        title,
        permalink,
      },
    ];
  }, []);
})(require.context("../../blog", false, /.md/));

const postsByYear = allPosts.reduceRight((posts, post) => {
  const year = post.date.split("-")[0];
  const yearPosts = posts.get(year) || [];
  return posts.set(year, [post, ...yearPosts]);
}, new Map());

const yearsOfPosts = Array.from(postsByYear, ([year, posts]) => ({
  year,
  posts,
}));

function Year(
  /** @type {{ year: string; posts: Array<{ date: string; formattedDate: string; title: string; permalink: string; }}>} */ {
    year,
    posts,
  }
) {
  return (
    <div className={clsx("col col--4", styles.feature)}>
      <h3>{year}</h3>
      <ul>
        {posts.map((post) => (
          <li key={post.date}>
            <Link to={post.permalink}>
              {post.formattedDate} - {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BlogFeed() {
  return (

      <main>
        {yearsOfPosts && yearsOfPosts.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {yearsOfPosts.map((props, idx) => (
                  <Year key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

  );
}

export default BlogFeed;