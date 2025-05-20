import { useState } from 'react';
import { Calendar } from 'lucide-react';

// Loading Component
const TimetableLoadingScreen = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 text-center">
                {/* Main loading container */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-16 shadow-2xl border border-white/20 max-w-md mx-auto">
                    
                    {/* Spinning logo/icon */}
                    <div className="relative mb-8">
                        <div className="w-32 h-32 mx-auto relative">
                            {/* Outer ring */}
                            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                            {/* Spinning ring 1 */}
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin"></div>
                            {/* Spinning ring 2 - counter rotation */}
                            <div className="absolute inset-2 rounded-full border-4 border-transparent border-r-pink-400 animate-spin-reverse"></div>
                            {/* Inner spinning ring */}
                            <div className="absolute inset-4 rounded-full border-2 border-transparent border-b-blue-400 animate-spin-slow"></div>
                            {/* Center icon */}
                            <Calendar className="w-12 h-12 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                    </div>

                    {/* Main title */}
                    <h1 className="text-3xl font-bold text-white mb-8">
                        Creating Your Timetable
                    </h1>

                    {/* Pulsing dots */}
                    <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce animation-delay-200"></div>
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce animation-delay-400"></div>
                    </div>
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${3 + Math.random() * 2}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Custom styles */}
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .animate-blob {
                    animation: blob 7s infinite;
                }
                
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
                
                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                
                .animate-spin-reverse {
                    animation: spin-reverse 2s linear infinite;
                }
                
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default TimetableLoadingScreen;