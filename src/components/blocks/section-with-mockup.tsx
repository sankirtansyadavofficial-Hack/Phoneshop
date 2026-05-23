'use client';

import React from "react";
import { motion } from "framer-motion";

interface SectionWithMockupProps {
    title: string | React.ReactNode;
    description: string | React.ReactNode;
    primaryImageSrc: string;
    secondaryImageSrc: string;
    reverseLayout?: boolean;
}

const SectionWithMockup: React.FC<SectionWithMockupProps> = ({
    title,
    description,
    primaryImageSrc,
    secondaryImageSrc,
    reverseLayout = false,
}) => {

    const containerVariants = {
        hidden: {},
        visible: {
             transition: {
                staggerChildren: 0.2,
            }
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as any } },
    };

    const layoutClasses = reverseLayout
        ? "md:grid-cols-2 md:grid-flow-col-dense"
        : "md:grid-cols-2";

    const textOrderClass = reverseLayout ? "md:col-start-2" : "";
    const imageOrderClass = reverseLayout ? "md:col-start-1" : "";

    return (
        <section className="relative py-20 md:py-32 bg-black/20 overflow-hidden border-t border-white/5">
            <div className="container max-w-5xl w-full px-6 relative z-10 mx-auto">
                <motion.div
                     className={`grid grid-cols-1 gap-12 md:gap-16 w-full items-center ${layoutClasses}`}
                     variants={containerVariants}
                     initial="hidden"
                     whileInView="visible"
                     viewport={{ once: true, amount: 0.2 }}
                >
                    {/* Text Content */}
                    <motion.div
                        className={`flex flex-col items-start gap-4 max-w-[500px] mx-auto md:mx-0 ${textOrderClass}`}
                        variants={itemVariants}
                    >
                        <div className="space-y-2">
                            <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                                {title}
                            </h2>
                        </div>

                        <div className="text-gray-400 text-sm md:text-base leading-relaxed">
                            {description}
                        </div>
                    </motion.div>

                    {/* App mockup/Image Content */}
                    <motion.div
                        className={`relative mx-auto ${imageOrderClass} w-full max-w-[280px] md:max-w-[420px]`}
                        variants={itemVariants}
                    >
                        {/* Decorative Background Element */}
                        <motion.div
                             className="absolute w-[280px] h-[300px] md:w-[420px] md:h-[450px] bg-blue-900/10 rounded-[32px] z-0"
                             style={{
                                top: reverseLayout ? 'auto' : '10%',
                                bottom: reverseLayout ? '10%' : 'auto',
                                left: reverseLayout ? 'auto' : '-10%',
                                right: reverseLayout ? '-10%' : 'auto',
                                filter: 'blur(30px)'
                            }}
                            initial={{ y: 0 }}
                            whileInView={{ y: reverseLayout ? -20 : -30 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            viewport={{ once: true, amount: 0.5 }}
                        >
                            <div
                                className="relative w-full h-full bg-cover bg-center rounded-[32px]"
                                style={{
                                    backgroundImage: `url(${secondaryImageSrc})`,
                                    backgroundSize: "cover"
                                }}
                            />
                        </motion.div>

                        {/* Main Mockup Card */}
                        <motion.div
                            className="relative w-full h-[360px] md:h-[500px] bg-white/[0.03] rounded-[32px] border border-white/10 backdrop-blur-xl z-10 overflow-hidden shadow-2xl"
                            initial={{ y: 0 }}
                            whileInView={{ y: reverseLayout ? 15 : 25 }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                            viewport={{ once: true, amount: 0.5 }}
                        >
                            <div className="p-0 h-full">
                                <div className="h-full relative bg-black/40">
                                    {/* Primary Image */}
                                    <div
                                        className="w-full h-full bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url(${primaryImageSrc})`,
                                            backgroundSize: "cover"
                                        }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Decorative bottom gradient line */}
            <div
                className="absolute w-full h-px bottom-0 left-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
        </section>
    );
};

export default SectionWithMockup;
