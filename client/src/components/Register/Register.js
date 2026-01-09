import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
// Importing the local logo from the src folder
import logo from '../../logo.svg';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '',
        phoneNumber: '', password: '', verifyPassword: '', image: null
    });

    const [errors, setErrors] = useState({});
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    /**
     * Converts the selected image file to Base64 string for 
     * backend compatibility with the Node.js server.
     */
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    /**
     * Validates input fields for each step before proceeding.
     */
    const validateStep = () => {
        const newErrors = {};
        if (step === 1 && !formData.firstName) newErrors.firstName = "First name is required";

        if (step === 2) {
            if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
            if (!formData.image) newErrors.image = "Profile picture is required";
        }

        if (step === 3) {
            if (!formData.email) newErrors.email = "Email is required";
            if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
            if (formData.password !== formData.verifyPassword) {
                newErrors.verifyPassword = "Passwords do not match";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (validateStep()) setStep(step + 1);
    };

    /**
     * Final form submission to the backend API on port 3000.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        try {
            const base64Image = await convertToBase64(formData.image);
            const response = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    password: formData.password,
                    image: base64Image
                })
            });

            if (response.status === 201) {
                navigate('/login');
            } else {
                const data = await response.json();
                setErrors({ server: data.error || "Registration failed" });
            }
        } catch (error) {
            setErrors({ server: "Server connection error. Is Docker running?" });
        }
    };

    return (
        <div className="copa-register-container">
            <div className="copa-card shadow-sm">

                {/* Left Side: Branding and Contextual Header */}
                <div className="copa-left-side">
                    <img src={logo} alt="CopaDrive Logo" width="90" className="mb-4" />
                    <h1 className="copa-title">
                        {step === 1 && "Create a Copa Account"}
                        {step === 2 && "Basic information"}
                        {step === 3 && "Secure credentials"}
                    </h1>
                    <p className="copa-subtitle">
                        {step === 1 && "Enter your name"}
                        {step === 2 && "Enter your phone and photo"}
                        {step === 3 && "Finish setting up your account"}
                    </p>
                </div>

                {/* Right Side: Interactive Form Area */}
                <div className="copa-right-side">
                    <form onSubmit={step === 3 ? handleSubmit : handleNext} className="copa-form-content">

                        {step === 1 && (
                            <div className="copa-input-stack">
                                <input type="text" className="copa-input" placeholder="First name"
                                    value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                                <input type="text" className="copa-input" placeholder="Last name (Optional)"
                                    value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                                {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="copa-input-stack text-center">
                                <div className="copa-profile-upload mx-auto mb-4" onClick={() => fileInputRef.current.click()}>
                                    {preview ? <img src={preview} alt="Profile" /> : <span>Add Photo</span>}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setFormData({ ...formData, image: file });
                                        setPreview(URL.createObjectURL(file));
                                    }
                                }} hidden accept="image/*" />
                                <input type="tel" className="copa-input" placeholder="Phone number"
                                    value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
                                {errors.phoneNumber && <small className="text-danger d-block">{errors.phoneNumber}</small>}
                                {errors.image && <small className="text-danger d-block">{errors.image}</small>}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="copa-input-stack">
                                <input type="email" className="copa-input mb-3" placeholder="Email address"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                <input type="password" className="copa-input mb-3" placeholder="Password"
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                <input type="password" className="copa-input" placeholder="Confirm Password"
                                    value={formData.verifyPassword} onChange={e => setFormData({ ...formData, verifyPassword: e.target.value })} />
                                {errors.password && <small className="text-danger d-block">{errors.password}</small>}
                                {errors.verifyPassword && <small className="text-danger d-block">{errors.verifyPassword}</small>}
                            </div>
                        )}

                        {/* Action Bar: Back/Login Link and Primary Button aligned to Right */}
                        <div className="copa-action-bar mt-auto">
                            {errors.server && <div className="alert alert-danger w-100 mb-3 py-1 small">{errors.server}</div>}

                            <div className="d-flex justify-content-end align-items-center gap-4 w-100">
                                {step === 1 ? (
                                    <button type="button" className="btn-link-google" onClick={() => navigate('/login')}>
                                        Sign in instead
                                    </button>
                                ) : (
                                    <button type="button" className="btn-secondary-copa" onClick={() => setStep(step - 1)}>
                                        Back
                                    </button>
                                )}

                                <button type="submit" className="btn-primary-copa">
                                    {step < 3 ? "Next" : "Submit"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;