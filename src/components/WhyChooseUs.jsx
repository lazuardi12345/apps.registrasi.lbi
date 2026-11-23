import React, { useEffect, useState } from "react";
import whyUsImg from "../assets/why-us.png";
import api, { resolveImageUrl } from "../services/api";

export default function WhyChooseUs() {
  const [reasonList, setReasonList] = useState([]);

  useEffect(() => {
    let isMounted = true;
    api.getBanners("feature_block").then((res) => {
      if (isMounted && res?.data && res.data.length > 0) {
        const mapped = res.data.map((item) => ({
          title: item.title,
          desc: item.description,
          image: item.image_url ? resolveImageUrl(item.image_url) : null,
        }));
        setReasonList(mapped);
      } else if (isMounted) {
        setReasonList([]);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="why-us-section">
      <div className="container why-us-inner">

        {/* Left Column: Image with floating badges */}
        <div className="why-us-image-side">
          <div className="why-us-img-container">
            <img src={whyUsImg} alt="Mengapa Memilih LBI FIB UI" className="why-us-img" />
            <div className="why-us-img-badge">
              <i className="ti ti-certificate" />
              <span>Standar UI</span>
            </div>
            <div className="why-us-img-badge-2">
              <i className="ti ti-world" />
              <span>Mitra Global</span>
            </div>
          </div>
        </div>

        {/* Right Column: Intro, Grid cards, and Stats */}
        <div className="why-us-content-side">
          <div className="why-us-intro">
            <span className="section-subtitle light">KEUNGGULAN LBI</span>
            <h2 className="why-us-title">Mengapa Memilih Kami?</h2>
            <p className="why-us-lead">
              Kami berkomitmen memberikan kualitas pembelajaran bahasa terbaik dengan standar akademis Universitas Indonesia yang tepercaya di tingkat internasional.
            </p>
          </div>

          <div className="why-us-grid">
            {reasonList.map((r, idx) => (
              <div key={r.title} className="why-us-card">
                <div className="why-us-icon-box">
                  <i className={idx === 0 ? "ti ti-bulb" : idx === 1 ? "ti ti-school" : "ti ti-certificate"} />
                </div>
                <div className="why-us-content">
                  <h3>{r.title}</h3>
                  <p>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
