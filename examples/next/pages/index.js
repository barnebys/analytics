import React from "react";
import Head from "next/head";
import Nav from "../components/nav";

const Home = () => (
  <div>
    <Head>
      <title>Home</title>
      <link rel="icon" href="/favicon.ico" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
        (function(i,s,o,g,r,a,m){
          i['BarnebysAnalyticsObject']=r;
          i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();
          a=s.createElement(o),m=s.getElementsByTagName(o)[0];
          a.async=1;
          a.src=g;
          m.parentNode.insertBefore(a,m)
        })(window,document,'script','http://localhost:3000/bite.v1.js','ba');
        ba('debug');
        ba('init', 'client-123', 'user-123,session-1');
      `
        }}
      ></script>
    </Head>

    <Nav />

    <div className="hero">
      <h1 className="title">Welcome to Bite.js!</h1>
      <p className="description">
        To simulate a click from barnebys click{" "}
        <a href="/?btm_refs=test-ref">here</a>
      </p>

      <div className="row">
        <a
          className="card"
          onClick={() => window.ba("send", "event", "sign in", "registration")}
        >
          <h3>Member signup event &rarr;</h3>
          <p>This will send a member signup event</p>
        </a>
        <a
          className="card"
          onClick={() =>
            window.ba(
              "send",
              "event",
              "bids",
              "winning",
              "item-123",
              "100.0",
              "EUR"
            )
          }
        >
          <h3>Bid event &rarr;</h3>
          <p>This will send a bid event</p>
        </a>
        <a
          className="card"
          onClick={() =>
            window.ba(
              "send",
              "event",
              "purchase",
              "auction",
              "item-123",
              "100.0",
              "EUR"
            )
          }
        >
          <h3>Win event &rarr;</h3>
          <p>This will send a winning event</p>
        </a>
        <a
          className="card"
          onClick={() => {
            window.ba("refs", "user-123");
            window.ba(
              "send",
              "event",
              "purchase",
              "auction",
              "item-123",
              "100.0",
              "EUR"
            );
          }}
        >
          <h3>SPA Event &rarr;</h3>
          <p>This will send a bid event for SPA</p>
        </a>
      </div>
    </div>

    <style jsx>{`
      .hero {
        width: 100%;
        color: #333;
      }
      .title {
        margin: 0;
        width: 100%;
        padding-top: 80px;
        line-height: 1.15;
        font-size: 48px;
      }
      .title,
      .description {
        text-align: center;
      }
      .row {
        max-width: 880px;
        margin: 80px auto 40px;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
      }
      .card {
        padding: 18px 18px 24px;
        width: 220px;
        text-align: left;
        text-decoration: none;
        color: #434343;
        border: 1px solid #9b9b9b;
      }
      .card:hover {
        border-color: #067df7;
      }
      .card h3 {
        margin: 0;
        color: #067df7;
        font-size: 18px;
      }
      .card p {
        margin: 0;
        padding: 12px 0 0;
        font-size: 13px;
        color: #333;
      }
    `}</style>
  </div>
);

export default Home;
