import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/autoplay";
import "./Testimonials.css";

const testimonials = [
  {
    name: "Aarav Patel",
    title: "Organic Farmer, Gujarat",
    text: "EcoHarvest transformed the way I manage my fields. The insights helped increase my yield by 25% this season!",
    image: "https://i.pravatar.cc/100?img=32",
  },
  {
    name: "Meera Sharma",
    title: "AgriTech Consultant",
    text: "An amazing tool! It’s intuitive and backed by real-time data that’s incredibly accurate and valuable.",
    image: "https://i.pravatar.cc/100?img=45",
  },
  {
    name: "Ravi Verma",
    title: "Farm Co-op Owner",
    text: "Our co-op has adopted EcoHarvest across 14 farms. The satellite data and predictions are top-notch.",
    image: "https://i.pravatar.cc/100?img=64",
  },
  {
    name: "Sunita Rao",
    title: "Precision Farming Expert",
    text: "From analytics to soil mapping, EcoHarvest brings powerful tools to the field in a way that's easy to use.",
    image: "https://i.pravatar.cc/100?img=52",
  },
  {
    name: "Devansh Joshi",
    title: "Agricultural Economist",
    text: "One of the most impactful platforms in smart agriculture. The data insights are game changers.",
    image: "https://i.pravatar.cc/100?img=27",
  },
];

export default function TestimonialCarousel() {
  return (
    <section className="testimonial-section">
      <div className="testimonial-container">
        <h2 className="testimonial-title">What People Are Saying</h2>
        <p className="testimonial-subtitle">
          Trusted by farmers and experts across the nation
        </p>

        <Swiper
          spaceBetween={24}
          slidesPerView={3}
          loop={true}
          autoplay={{ delay: 2000 }}
          modules={[Autoplay]}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {testimonials.map((t, index) => (
            <SwiperSlide key={index}>
              <motion.div
                className="testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <img
                  src={t.image}
                  alt={t.name}
                  className="testimonial-avatar"
                />
                <p className="testimonial-text">“{t.text}”</p>
                <h4 className="testimonial-name">{t.name}</h4>
                <p className="testimonial-role">{t.title}</p>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
