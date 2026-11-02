import React from "react";
import pageNotFound from "../assets/img/page-not-found.png";

const PageNotFound = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div
        className="d-flex flex-column justify-content-center align-items-center gap-3"
        style={{ fontFamily: "var(--font-roboto)", marginTop: "120px" }}
      >
        <h1>Page not found!</h1>
        <p className="text-black text-decoration-none fst-normal fs-6">
          Sorry, we couldn't find this page.
        </p>

        <img src={pageNotFound} style={{ width: "550px" }} />

        <a className="btn btn-primary" href="/it-asset/home">
          back to Home
        </a>
      </div>
    </div>
  );
};

export default PageNotFound;
