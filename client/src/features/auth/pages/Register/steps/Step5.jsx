import React from "react";
import { FiCheckCircle } from "react-icons/fi";

const Step5 = () => {
  return (
    <div className="text-center py-4">
      {/* Elegant Success Icon */}
      <div className="mb-4 text-success" style={{ fontSize: "64px" }}>
        <FiCheckCircle />
      </div>

      <h2 className="h4 fw-bold mb-3">
        Success! Your account is ready.
      </h2>

      <p className="text-secondary mb-4">
        We're excited to have you join the <strong>CopaDrive</strong> family.
        <br />
        From now on, all your files are safe in one place.
      </p>
    </div>
  );
};

export default Step5;