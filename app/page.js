'use client';

import { useEffect } from 'react';

// Base path for GitHub Pages deployment
const basePath = '';


export default function Home() {
    useEffect(() => {
        // Legacy Script Logic
        const customSelects = Array.from(document.querySelectorAll('.custom-select'));
        const galleryRadios = Array.from(document.querySelectorAll('input[name="gallery"]'));
        const navLinks = Array.from(document.querySelectorAll('nav a'));
        const sections = Array.from(document.querySelectorAll('section[id]'));
        const navTargets = navLinks
            .map(link => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);
        const sectionRatios = new Map(navTargets.map(section => [section.id, 0]));
        let manualOverride = null;

        // Detect touch capability
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) {
            document.body.classList.add('touch-device');
        } else {
            document.body.classList.add('no-touch-device');
        }

        const setCarouselBackgrounds = () => {
            const carousels = document.querySelectorAll('.gallery-carousel');
            carousels.forEach(carousel => {
                const firstImage = carousel.querySelector('.carousel-slide img');
                if (firstImage?.src) {
                    carousel.style.setProperty('--carousel-bg-image', `url("${firstImage.src}")`);
                }
            });
        };

        const initCarouselArrows = () => {
            const tracks = document.querySelectorAll('.carousel-track');
            tracks.forEach(track => {
                const slides = Array.from(track.children);
                if (!slides.length) return;

                const goToSlide = (targetIndex) => {
                    slides[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                };

                slides.forEach((slide) => {
                    if (!slide.querySelector('.carousel-arrow')) {
                        const currentIndex = slides.indexOf(slide);

                        if (currentIndex > 0) {
                            const prevBtn = document.createElement('button');
                            prevBtn.className = 'carousel-arrow arrow-prev';
                            prevBtn.type = 'button';
                            prevBtn.setAttribute('aria-label', 'Previous image');
                            prevBtn.textContent = '‹';
                            prevBtn.addEventListener('click', (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                goToSlide(currentIndex - 1);
                            });
                            slide.append(prevBtn);
                        }

                        if (currentIndex < slides.length - 1) {
                            const nextBtn = document.createElement('button');
                            nextBtn.className = 'carousel-arrow arrow-next';
                            nextBtn.type = 'button';
                            nextBtn.setAttribute('aria-label', 'Next image');
                            nextBtn.textContent = '›';
                            nextBtn.addEventListener('click', (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                goToSlide(currentIndex + 1);
                            });
                            slide.append(nextBtn);
                        }
                    }
                });
            });
        };

        const forceCarouselReflow = () => {
            // Use setTimeout to let DOM/images settle first
            setTimeout(() => {
                // First, clear existing carousel arrows
                const existingArrows = document.querySelectorAll('.carousel-arrow');
                existingArrows.forEach(arrow => arrow.remove());
                
                // Regenerate arrows for all carousels
                initCarouselArrows();
                
                const carousels = document.querySelectorAll('.gallery-carousel');
                carousels.forEach(carousel => {
                    // Force layout calculation by reading offsetHeight
                    void carousel.offsetHeight;
                    // Trigger repaint by toggling a class
                    carousel.classList.add('reflow-fix');
                    requestAnimationFrame(() => {
                        carousel.classList.remove('reflow-fix');
                    });
                });
            }, 50); // 50ms delay to let content settle
        };

        const closeAllSelects = (except = null) => {
            customSelects.forEach(select => {
                if (select !== except) {
                    select.classList.remove('open');
                    const trigger = select.querySelector('.custom-select-trigger');
                    if (trigger) trigger.setAttribute('aria-expanded', 'false');
                }
            });
        };

        const initCustomSelect = (select) => {
            const trigger = select.querySelector('.custom-select-trigger');
            const options = Array.from(select.querySelectorAll('.custom-select-option'));
            const type = select.dataset.selectType;
            const defaultValue = select.dataset.defaultValue || options[0]?.dataset.value;
            const testimonialTargetSelector = select.dataset.testimonialTarget;
            const testimonialTarget = testimonialTargetSelector ? document.querySelector(testimonialTargetSelector) : null;

            if (!trigger || options.length === 0) return;

            const closeMenu = () => {
                select.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');
            };

            const openMenu = () => {
                closeAllSelects(select);
                select.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            };

            const updateTestimonials = (category) => {
                if (!testimonialTarget) return;
                const testimonials = testimonialTarget.querySelectorAll('.testimonial');
                testimonials.forEach(card => {
                    card.style.display = card.dataset.category === category ? 'block' : 'none';
                });
            };

            const updateGalleryRadio = (value) => {
                const radio = document.getElementById(`${value}-radio`);
                if (radio && !radio.checked) {
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };

            const updateJobPanel = (jobSelect, jobValue) => {
                const galleryPanel = jobSelect.closest('.gallery-panel');
                if (!galleryPanel) return;

                const jobPanels = galleryPanel.querySelectorAll('.job-panel');
                jobPanels.forEach(panel => {
                    if (panel.dataset.job === jobValue) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });

                // Force reflow on the newly active panel's carousel
                forceCarouselReflow();
            };

            const setSelection = (value) => {
                const option = options.find(opt => opt.dataset.value === value);
                if (!option) return;

                options.forEach(opt => {
                    const isSelected = opt === option;
                    if (isSelected) {
                        opt.setAttribute('data-selected', 'true');
                    } else {
                        opt.removeAttribute('data-selected');
                    }
                    opt.setAttribute('aria-selected', String(isSelected));
                });

                trigger.innerHTML = option.innerHTML;

                if (type === 'gallery') {
                    updateGalleryRadio(value);
                } else if (type === 'testimonials') {
                    updateTestimonials(value);
                } else if (type === 'job') {
                    updateJobPanel(select, value);
                }

                closeMenu();
            };

            trigger.addEventListener('click', () => {
                if (select.classList.contains('open')) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });

            options.forEach(opt => {
                opt.addEventListener('click', () => setSelection(opt.dataset.value));
            });

            if (type === 'gallery') {
                galleryRadios.forEach(radio => {
                    radio.addEventListener('change', () => {
                        if (radio.checked) {
                            const value = radio.id.replace('-radio', '');
                            setSelection(value);
                        }
                    });
                });
            }

            const initialValue = defaultValue || options[0].dataset.value;
            setSelection(initialValue);
        };

        const initExpandHints = () => {
            const slides = document.querySelectorAll('.carousel-slide');
            slides.forEach(slide => {
                const img = slide.querySelector('img');
                const hint = slide.querySelector('.expand-hint');
                if (!img || !hint) return;

                const checkAspectRatio = () => {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    // ratio > 1.2 covers most landscape formats (3:2, 16:9)
                    if (ratio < 1.2) {
                        hint.style.display = 'flex';
                        img.classList.add('is-expandable');
                    } else {
                        hint.style.display = 'none';
                        img.classList.remove('is-expandable');
                    }
                };

                if (img.complete) {
                    checkAspectRatio();
                } else {
                    img.addEventListener('load', checkAspectRatio);
                }
            });
        };

        customSelects.forEach(initCustomSelect);
        setCarouselBackgrounds();
        initCarouselArrows();
        initExpandHints();
        forceCarouselReflow();

        const setActiveNav = (targetHash) => {
            navLinks.forEach(link => {
                if (targetHash && link.getAttribute('href') === targetHash) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        };

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                manualOverride = link.getAttribute('href');
                setActiveNav(manualOverride);
            });
        });

        setActiveNav(null);

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (sectionRatios.has(entry.target.id)) {
                    sectionRatios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
                }
            });

            const bestMatch = Array.from(sectionRatios.entries())
                .sort((a, b) => b[1] - a[1])
                .find(([, ratio]) => ratio > 0.05);

            const newActive = bestMatch ? `#${bestMatch[0]}` : null;

            if (manualOverride) {
                if (manualOverride === newActive) {
                    manualOverride = null;
                    setActiveNav(newActive);
                }
                return;
            }

            setActiveNav(newActive);
        }, {
            threshold: [0, 0.15, 0.35, 0.55, 0.75],
            rootMargin: '-12% 0px -12% 0px'
        });

        navTargets.forEach(section => sectionObserver.observe(section));

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.custom-select')) {
                closeAllSelects();
            }
        });

        /* Lightbox Logic */
        const lightbox = document.getElementById('lightbox');
        const lightboxContent = lightbox.querySelector('.lightbox-content');
        const lightboxCounter = lightbox.querySelector('.lightbox-counter');
        const prevBtn = lightbox.querySelector('.arrow-prev');
        const nextBtn = lightbox.querySelector('.arrow-next');
        let lightboxTrack; // This will be created dynamically

        let currentLightboxImages = [];
        let currentLightboxIndex = 0;

        const showLightboxImage = (index) => {
            if (index < 0 || index >= currentLightboxImages.length || !lightboxTrack) {
                return;
            }
            
            currentLightboxIndex = index;
            const offset = -index * 100;
            lightboxTrack.style.transform = `translateX(${offset}%)`;

            lightboxCounter.textContent = `${index + 1} / ${currentLightboxImages.length}`;

            // Hide/show arrows at boundaries
            prevBtn.style.display = index === 0 ? 'none' : 'block';
            nextBtn.style.display = index === currentLightboxImages.length - 1 ? 'none' : 'block';
        };

        const openLightbox = (images, startIndex) => {
            currentLightboxImages = images;
            
            // Create and append the track
            lightboxTrack = document.createElement('div');
            lightboxTrack.className = 'lightbox-track';
            
            images.forEach(imgMeta => {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'lightbox-image-container';
                const img = document.createElement('img');
                img.src = imgMeta.src;
                img.alt = imgMeta.alt;
                imgContainer.appendChild(img);
                lightboxTrack.appendChild(imgContainer);
            });
            
            // Clear previous content and append new track
            while (lightboxContent.firstChild) {
                lightboxContent.removeChild(lightboxContent.firstChild);
            }
            lightboxContent.appendChild(lightboxTrack);

            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            positionLightboxArrows();
            window.addEventListener('resize', positionLightboxArrows);

            // Use a slight delay to allow the DOM to update before transitioning
            setTimeout(() => {
                showLightboxImage(startIndex);
            }, 50);
        };

        const closeLightbox = () => {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            window.removeEventListener('resize', positionLightboxArrows);

            // Clean up after transition
            setTimeout(() => {
                while (lightboxContent.firstChild) {
                    lightboxContent.removeChild(lightboxContent.firstChild);
                }
                currentLightboxImages = [];
                currentLightboxIndex = 0;
                lightboxTrack = null;
            }, 300);
        };

        // Attach click listener to document for delegation to images
        const handleImageClick = (e) => {
            const clickedImg = e.target.closest('.carousel-slide img.is-expandable');
            if (clickedImg) {
                const carouselTrack = clickedImg.closest('.carousel-track');
                if (carouselTrack) {
                    const allImages = Array.from(carouselTrack.querySelectorAll('.carousel-slide img'));
                    const imageMetas = allImages.map(img => ({ src: img.src, alt: img.alt }));
                    const clickedIndex = allImages.findIndex(img => img.src === clickedImg.src);

                    if (clickedIndex !== -1) {
                        openLightbox(imageMetas, clickedIndex);
                    }
                }
            }
        };
        document.addEventListener('click', handleImageClick);

        const handleLightboxClick = (e) => {
            if (e.target.closest('.lightbox-arrow')) {
                return; // Don't close if clicking an arrow
            }
            closeLightbox();
        };
        lightbox.addEventListener('click', handleLightboxClick);

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent handleLightboxClick from firing
            showLightboxImage(currentLightboxIndex - 1);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent handleLightboxClick from firing
            showLightboxImage(currentLightboxIndex + 1);
        });

        const handleKeyDown = (e) => {
            if (!lightbox.classList.contains('open')) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showLightboxImage(currentLightboxIndex - 1);
            } else if (e.key === 'ArrowRight') {
                showLightboxImage(currentLightboxIndex + 1);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        const positionLightboxArrows = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            let boxWidth = (16 / 9) * viewportHeight;
            let boxHeight = viewportHeight;

            if (boxWidth > viewportWidth) {
                boxWidth = viewportWidth;
                boxHeight = (9 / 16) * viewportWidth;
            }

            const horizontalMargin = (viewportWidth - boxWidth) / 2;
            const arrowMargin = 20; // 20px from the edge of the virtual 16:9 box

            prevBtn.style.left = `${horizontalMargin + arrowMargin}px`;
            nextBtn.style.right = `${horizontalMargin + arrowMargin}px`;
        };

        let touchStartX = 0;
        let touchEndX = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.changedTouches[0].screenX;
        };

        const handleTouchMove = (e) => {
            touchEndX = e.changedTouches[0].screenX;
        };

        const handleTouchEnd = () => {
            if (touchStartX - touchEndX > 50) {
                showLightboxImage(currentLightboxIndex + 1);
            } else if (touchEndX - touchStartX > 50) {
                showLightboxImage(currentLightboxIndex - 1);
            }
        };

        lightbox.addEventListener('touchstart', handleTouchStart);
        lightbox.addEventListener('touchmove', handleTouchMove);
        lightbox.addEventListener('touchend', handleTouchEnd);

        // Cleanup
        return () => {
            document.removeEventListener('click', handleImageClick);
            document.removeEventListener('keydown', handleKeyDown);
            lightbox.removeEventListener('touchstart', handleTouchStart);
            lightbox.removeEventListener('touchmove', handleTouchMove);
            lightbox.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('resize', positionLightboxArrows);
            // IntersectionObserver cleanup if possible, but minimal impact here
        };


    }, []);

    return (
        <>
            <header>
                <a href="#hero" className="logo-link">
                    <img src="/OneManAndAToolbox/images/toolboxlogo.png" alt="Toolbox Logo" />
                </a>
                <nav>
                    <ul>
                        <li><a href="#services">Services</a></li>
                        <li><a href="#gallery">Gallery</a></li>
                        <li><a href="#testimonies">Testimonials</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#area">Area</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </nav>
            </header>

            <div className="container">
                <section id="hero" className="hero">
                    <div className="hero-content">
                        <img src="/OneManAndAToolbox/images/toolboxlogo.png" alt="One Man and a Toolbox logo" className="hero-logo" />
                        <h2>Your Friendly & Reliable Local Handyman</h2>
                        <p>For all the odd jobs and repairs around your home in parts of W5, W13, W7 & TW8. Can I get a woop woop</p>
                    </div>
                </section>

                <section id="services">
                    <h2>My Services</h2>
                    <div className="services-grid">
                        <div className="service">
                            <i className="fas fa-wrench"></i>
                            <h3>General Repairs & Maintenance</h3>
                            <p>Fixing leaks, patch-ups, and general home repairs.</p>
                        </div>
                        <div className="service">
                            <i className="fas fa-tint"></i>
                            <h3>Minor Plumbing</h3>
                            <p>Fixing taps, pipes, and basic plumbing issues.</p>
                        </div>
                        <div className="service">
                            <i className="fas fa-paint-brush"></i>
                            <h3>Painting & Decorating</h3>
                            <p>Interior and exterior painting, decorating services.</p>
                        </div>
                        <div className="service">
                            <i className="fas fa-tools"></i>
                            <h3>Carpentry & Woodwork</h3>
                            <p>Custom woodwork, repairs, and installations.</p>
                        </div>
                        <div className="service">
                            <i className="fas fa-bolt"></i>
                            <h3>Minor Electrical</h3>
                            <p>Socket replacements, lighting installations and fixes.</p>
                        </div>
                        <div className="service">
                            <i className="fas fa-leaf"></i>
                            <h3>Garden Maintenance & Projects</h3>
                            <p>Lawn care, fencing, and landscaping projects.</p>
                        </div>
                    </div>
                </section>

                <section id="gallery">
                    <h2>Previous Work Gallery</h2>
                    <input type="radio" id="general-radio" name="gallery" defaultChecked style={{ display: 'none' }} />
                    <input type="radio" id="plumbing-radio" name="gallery" style={{ display: 'none' }} />
                    <input type="radio" id="decorating-radio" name="gallery" style={{ display: 'none' }} />
                    <input type="radio" id="carpentry-radio" name="gallery" style={{ display: 'none' }} />
                    <input type="radio" id="electrical-radio" name="gallery" style={{ display: 'none' }} />
                    <input type="radio" id="landscaping-radio" name="gallery" style={{ display: 'none' }} />
                    <div className="custom-select-container">
                        <div className="custom-select" data-select-type="gallery" data-default-value="general">
                            <button type="button" className="custom-select-trigger" aria-expanded="false" aria-label="Select project type"></button>
                            <ul className="custom-select-options" role="listbox">
                                <li>
                                    <button type="button" className="custom-select-option" data-value="general" role="option" aria-selected="false">General Repairs &amp; Maintenance</button>
                                </li>
                                <li>
                                    <button type="button" className="custom-select-option" data-value="plumbing" role="option" aria-selected="false">Minor Plumbing</button>
                                </li>
                                <li>
                                    <button type="button" className="custom-select-option" data-value="decorating" role="option" aria-selected="false">Painting &amp; Decorating</button>
                                </li>
                                <li>
                                    <button type="button" className="custom-select-option" data-value="carpentry" role="option" aria-selected="false">Carpentry &amp; Woodwork</button>
                                </li>
                                <li>
                                    <button type="button" className="custom-select-option" data-value="electrical" role="option" aria-selected="false">Minor Electrical</button>
                                </li>
                                <li>
                                    <button type="button" className="custom-select-option" data-value="landscaping" role="option" aria-selected="false">Garden Maintenance &amp; Projects</button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="gallery-display">
                        <div className="gallery-panel general">
                            <div className="custom-select-container">
                                <div className="custom-select" data-select-type="job" data-default-value="general-job-1">
                                    <button type="button" className="custom-select-trigger" aria-expanded="false" aria-label="Select project"></button>
                                    <ul className="custom-select-options" role="listbox">
                                        <li><button type="button" className="custom-select-option" data-value="general-job-1" role="option">Frosting of Bathroom Windows <span className="job-date">(Mar 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-2" role="option">Hanging a Very Heavy Mirror <span className="job-date">(Nov 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-4" role="option">Laid Vinyl Flooring <span className="job-date">(Jan 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-3" role="option">Footstool Reupholstery <span className="job-date">(Jul 2014)</span></button></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="job-panels-container">
                                <div className="job-panel" data-job="general-job-1">
                                    <div className="gallery-text">
                                        <p>Fitted stained glass frosting to upper bathroom windows.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_window_frosting(1).webp" alt="Bathroom Window Frosting 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_window_frosting(2).webp" alt="Bathroom Window Frosting 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_window_frosting(3).webp" alt="Bathroom Window Frosting 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-2">
                                    <div className="gallery-text">
                                        <p>Hanging a mirror where anything other than perfect symmetry to the left right and above and below would look terrible. As Austin Powers once said, I needed a "laser".</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_mirror_hanging(1).webp" alt="Hanging a Very Heavy Mirror 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_mirror_hanging(2).webp" alt="Hanging a Very Heavy Mirror 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-4">
                                    <div className="gallery-text">
                                        <p>Removed old carpet and grippers. Cut and final flooring. Installed oak door threshold.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_toilet_flooring(1).webp" alt="Laid Vinyl Flooring 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_toilet_flooring(2).webp" alt="Laid Vinyl Flooring 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_toilet_flooring(3).webp" alt="Laid Vinyl Flooring 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_toilet_flooring(4).webp" alt="Laid Vinyl Flooring 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_toilet_flooring(5).webp" alt="Laid Vinyl Flooring 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_toilet_flooring(6).webp" alt="Laid Vinyl Flooring 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-3">
                                    <div className="gallery-text">
                                        <p>Replaced tired foam and worn through material with custom cut High Density foam, and recovered stool with new material.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_reupholstery(1).webp" alt="Footstool Reupholstery 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/grm/grm_reupholstery(2).webp" alt="Footstool Reupholstery 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gallery-panel plumbing">
                            <div className="custom-select-container">
                                <div className="custom-select" data-select-type="job" data-default-value="plumbing-job-1">
                                    <button type="button" className="custom-select-trigger" aria-expanded="false" aria-label="Select project"></button>
                                    <ul className="custom-select-options" role="listbox">
                                        <li><button type="button" className="custom-select-option" data-value="plumbing-job-1" role="option">Installation of a Dual Flush System <span className="job-date">(Sep 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="plumbing-job-2" role="option">Washing Machine Waste Pipe Installation <span className="job-date">(Jul 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="plumbing-job-3" role="option">Installed a New Toilet <span className="job-date">(Jul 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="plumbing-job-4" role="option">Sink Refresh & Plumbing Overhaul <span className="job-date">(Mar 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="plumbing-job-5" role="option">Installation of a Dual Flush and Flexible Pipe Work <span className="job-date">(May 2018)</span></button></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="job-panels-container">
                                <div className="job-panel" data-job="plumbing-job-1">
                                    <div className="gallery-text">
                                        <p>Disconnected water inlet valve, water overflow pipe, old flush system and removed the whole cistern. Installed a new dual flush system and reconnected all pipes ensuring no leaks. Easier said than done!</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_dual_flush(1).webp" alt="Dual Flush Installation 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_dual_flush(2).webp" alt="Dual Flush Installation 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_dual_flush(3).webp" alt="Dual Flush Installation 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_dual_flush(4).webp" alt="Dual Flush Installation 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="plumbing-job-2">
                                    <div className="gallery-text">
                                        <p>Another builder smashed a washing machine waste pipe causing flooding. I plumbed in new waste piping and made a simple platform to repair the damaged floor.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_washing_machine_waste(1).webp" alt="Washing Machine Waste Repair 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_washing_machine_waste(2).webp" alt="Washing Machine Waste Repair 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_washing_machine_waste(3).webp" alt="Washing Machine Waste Repair 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_washing_machine_waste(4).webp" alt="Washing Machine Waste Repair 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_washing_machine_waste(5).webp" alt="Washing Machine Waste Repair 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_washing_machine_waste(6).webp" alt="Washing Machine Waste Repair 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_washing_machine_waste(7).webp" alt="Washing Machine Waste Repair 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_washing_machine_waste(8).webp" alt="Washing Machine Waste Repair 8" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_washing_machine_waste(9).webp" alt="Washing Machine Waste Repair 9" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_washing_machine_waste(10).webp" alt="Washing Machine Waste Repair 10" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="plumbing-job-3">
                                    <div className="gallery-text">
                                        <p>Installation of a "bog nouveau". All associated plumbing work completed.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_toilet_installation(1).webp" alt="Toilet Installation 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_toilet_installation(2).webp" alt="Toilet Installation 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_toilet_installation(3).webp" alt="Toilet Installation 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_toilet_installation(4).webp" alt="Toilet Installation 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="plumbing-job-4">
                                    <div className="gallery-text">
                                        <p>Removed old separate taps, ball and chain plug hole, waste trap and rigid copper piping. Replaced with modern mixer tap, inbuilt soap dispenser, click clack plug hole and waste trap. Installed flexible tap pipes with safety shut off valves.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_bathroom_sink(1).webp" alt="Sink Refresh 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_bathroom_sink(1.5).webp" alt="Sink Refresh 1.5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_bathroom_sink(2).webp" alt="Sink Refresh 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_bathroom_sink(3).webp" alt="Sink Refresh 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_bathroom_sink(4).webp" alt="Sink Refresh 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_bathroom_sink(5).webp" alt="Sink Refresh 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_bathroom_sink(6).webp" alt="Sink Refresh 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_bathroom_sink(7).webp" alt="Sink Refresh 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_bathroom_sink(8).webp" alt="Sink Refresh 8" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_bathroom_sink(9).webp" alt="Sink Refresh 9" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="plumbing-job-5">
                                    <div className="gallery-text">
                                        <p>Removed C and old fixed copper plumbing, removed old broken flush mechanism and installed a new dual flush mechanism. Re-installed system and associated plumbing including flexible tails emergency shut off valves.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_dual_flush(1).webp" alt="Dual Flush Installation 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_dual_flush(2).webp" alt="Dual Flush Installation 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_dual_flush(3).webp" alt="Dual Flush Installation 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/p/p_dual_flush(4).webp" alt="Dual Flush Installation 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gallery-panel decorating">
                            <div className="custom-select-container">
                                <div className="custom-select" data-select-type="job" data-default-value="decorating-job-3">
                                    <button type="button" className="custom-select-trigger" aria-expanded="false" aria-label="Select project"></button>
                                    <ul className="custom-select-options" role="listbox">
                                        <li><button type="button" className="custom-select-option" data-value="decorating-job-3" role="option">Damp Seal and Wall Painting <span className="job-date">(Oct 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="decorating-job-4" role="option">Partially Redecorated a Bathroom <span className="job-date">(Aug 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="decorating-job-5" role="option">Redecorated a Cubicle Toilet <span className="job-date">(Mar 2023)</span></button></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="job-panels-container">
                                <div className="job-panel" data-job="decorating-job-3">
                                    <div className="gallery-text">
                                        <p>Damp sealed and repainted the walls up to a loft room after a roofing leak.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_staircase_walls.webp" alt="Damp Seal and Wall Painting" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="decorating-job-4">
                                    <div className="gallery-text">
                                        <p>Water damage from penetrating damp and a leaky roof caused significant damage to the paintwork. I filled, damp sealed and repainted the damaged areas to bring it back to looking like new.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_bathroom_paint(1).webp" alt="Bathroom Redecoration 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_bathroom_paint(2).webp" alt="Bathroom Redecoration 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_bathroom_paint(3).webp" alt="Bathroom Redecoration 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_bathroom_paint(4).webp" alt="Bathroom Redecoration 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_bathroom_paint(5).webp" alt="Bathroom Redecoration 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_bathroom_paint(6).webp" alt="Bathroom Redecoration 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_bathroom_paint(7).webp" alt="Bathroom Redecoration 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_bathroom_paint(8).webp" alt="Bathroom Redecoration 8" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_bathroom_paint(9).webp" alt="Bathroom Redecoration 9" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="decorating-job-5">
                                    <div className="gallery-text">
                                        <p>Full redecoration inc stain and varnishing door, relevant wall paper stripping, filling, sanding, undercoats and top coats.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_toilet_redecoration(1).webp" alt="Redecorated a Cubicle Toilet 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_toilet_redecoration(2).webp" alt="Redecorated a Cubicle Toilet 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_toilet_redecoration(3).webp" alt="Redecorated a Cubicle Toilet 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_toilet_redecoration(4).webp" alt="Redecorated a Cubicle Toilet 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_toilet_redecoration(5).webp" alt="Redecorated a Cubicle Toilet 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_toilet_redecoration(6).webp" alt="Redecorated a Cubicle Toilet 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/pd/pd_toilet_redecoration(7).webp" alt="Redecorated a Cubicle Toilet 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gallery-panel carpentry">
                            <div className="custom-select-container">
                                <div className="custom-select" data-select-type="job" data-default-value="carpentry-job-2">
                                    <button type="button" className="custom-select-trigger" aria-expanded="false" aria-label="Select project"></button>
                                    <ul className="custom-select-options" role="listbox">
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-5" role="option">Construction of a Robot Vacuum Cleaner Ramp <span className="job-date">(Jan 2026)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-7" role="option">Construction of Herb Planters <span className="job-date">(Aug 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-8" role="option">Upcycling A Blanket Chest <span className="job-date">(Jul 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-6" role="option">Restoration of Teak Garden Furniture <span className="job-date">(Jul 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-2" role="option">Designed & Constructed a Waterproof Woodshed <span className="job-date">(Oct 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-1" role="option">Renovation of Outdoor Coffee Table <span className="job-date">(Sep 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-10" role="option">Built a Desk <span className="job-date">(Apr 2020)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-9" role="option">Built a Birdbox <span className="job-date">(May 2020)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-11" role="option">Built Two Coffee Tables <span className="job-date">(Apr 2018)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-12" role="option">Rustic Alcove Shelves <span className="job-date">(Jul 2015)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-4" role="option">Bespoke Carving Board <span className="job-date">(Dec 2013)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-3" role="option">Custom Built Chunky Stools <span className="job-date">(Nov 2013)</span></button></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="job-panels-container">
                                <div className="job-panel" data-job="carpentry-job-5">
                                    <div className="gallery-text">
                                        <p>Built ramp out of leftover waste materials so a robot vacuum cleaner could get around an Edwardian house.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_robovac_ramp(1).webp" alt="Robot Vacuum Ramp 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_robovac_ramp(2).webp" alt="Robot Vacuum Ramp 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_robovac_ramp(3).webp" alt="Robot Vacuum Ramp 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_robovac_ramp(4).webp" alt="Robot Vacuum Ramp 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-7">
                                    <div className="gallery-text">
                                        <p>I think the picture speaks for itself! The mistake I made was that the blackboard panels for chalking the names on looked good but the chalk tended to get washed off in the rain!</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_herb_planters(1).webp" alt="Herb Planters 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_herb_planters(2).webp" alt="Herb Planters 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_herb_planters(3).webp" alt="Herb Planters 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_herb_planters(4).webp" alt="Herb Planters 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_herb_planters(5).webp" alt="Herb Planters 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_herb_planters(6).webp" alt="Herb Planters 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_herb_planters(7).webp" alt="Herb Planters 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-8">
                                    <div className="gallery-text">
                                        <p>Lined and waterproofed (using shed felt) an old blanket chest to be used as outdoor storage for cushions.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_upcycling_chest(1).webp" alt="Upcycling Blanket Chest 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_upcycling_chest(2).webp" alt="Upcycling Blanket Chest 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_upcycling_chest(3).webp" alt="Upcycling Blanket Chest 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_upcycling_chest(4).webp" alt="Upcycling Blanket Chest 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_upcycling_chest(5).webp" alt="Upcycling Blanket Chest 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_upcycling_chest(6).webp" alt="Upcycling Blanket Chest 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_upcycling_chest(7).webp" alt="Upcycling Blanket Chest 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_upcycling_chest(8).webp" alt="Upcycling Blanket Chest 8" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-6">
                                    <div className="gallery-text">
                                        <p>Repaired and restored a vintage teak garden table and chairs.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_teak_furniture_restoral(1).webp" alt="Teak Furniture Restoration 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_teak_furniture_restoral(2).webp" alt="Teak Furniture Restoration 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_teak_furniture_restoral(3).webp" alt="Teak Furniture Restoration 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_teak_furniture_restoral(4).webp" alt="Teak Furniture Restoration 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-2">
                                    <div className="gallery-text">
                                        <p>Designed and constructed a waterproof woodshed out of upcycled materials. Hinged front doors from an old kitchen cabinet and a felt roof.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_woodshed(1).webp" alt="Woodshed Construction 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_woodshed(2).webp" alt="Woodshed Construction 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_woodshed(3).webp" alt="Woodshed Construction 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_woodshed(4).webp" alt="Woodshed Construction 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_woodshed(5).webp" alt="Woodshed Construction 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_woodshed(6).webp" alt="Woodshed Construction 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_woodshed(7).webp" alt="Woodshed Construction 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-1">
                                    <div className="gallery-text">
                                        <p>Refurbished a garden table using decking planks to make a new surface.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_outdoor_table_rebuild(1).webp" alt="Outdoor Table Rebuild 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_outdoor_table_rebuild(2).webp" alt="Outdoor Table Rebuild 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_outdoor_table_rebuild(3).webp" alt="Outdoor Table Rebuild 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_outdoor_table_rebuild(4).webp" alt="Outdoor Table Rebuild 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-3">
                                    <div className="gallery-text">
                                        <p>Designed and built two matching stools out of reclaimed joists. Intended to be family heirlooms for two siblings.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_matching_stools.webp" alt="Custom Built Chunky Stools" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-4">
                                    <div className="gallery-text">
                                        <p>Designed and built a bespoke carving board to match an antique silver cloche. Constructed it from an old oak table top.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_carving_board(1).webp" alt="Bespoke Carving Board 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_carving_board(1.5).webp" alt="Bespoke Carving Board 1.5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_carving_board(2).webp" alt="Bespoke Carving Board 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_carving_board(3).webp" alt="Bespoke Carving Board 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_carving_board(4).webp" alt="Bespoke Carving Board 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-10">
                                    <div className="gallery-text">
                                        <p>Converted a disused chest of drawers into a stylish modern desk.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(1).webp" alt="Desk Construction 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(2).webp" alt="Desk Construction 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(3).webp" alt="Desk Construction 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(4).webp" alt="Desk Construction 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(5).webp" alt="Desk Construction 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(6).webp" alt="Desk Construction 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(7).webp" alt="Desk Construction 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(8).webp" alt="Desk Construction 8" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(9).webp" alt="Desk Construction 9" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(10).webp" alt="Desk Construction 10" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(11).webp" alt="Desk Construction 11" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(12).webp" alt="Desk Construction 12" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(13).webp" alt="Desk Construction 13" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_desk(14).webp" alt="Desk Construction 14" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-9">
                                    <div className="gallery-text">
                                        <p>Upcycled wood offcuts to build a rustic birdbox.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_birdbox(1).webp" alt="Birdbox Construction 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_birdbox(2).webp" alt="Birdbox Construction 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-11">
                                    <div className="gallery-text">
                                        <p>Upcycled the leaves and legs from a dining table into two stylish coffee tables.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_stools(1).webp" alt="Coffee Tables Construction 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_stools(2).webp" alt="Coffee Tables Construction 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-12">
                                    <div className="gallery-text">
                                        <p>Rustic chunky alcove shelves built by carving and staining a modern piece of pine.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_rustic_shelves(1).webp" alt="Rustic Alcove Shelves 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/cw/cw_rustic_shelves(2).webp" alt="Rustic Alcove Shelves 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gallery-panel electrical">
                            <div className="custom-select-container">
                                <div className="custom-select" data-select-type="job" data-default-value="electrical-job-1">
                                    <button type="button" className="custom-select-trigger" aria-expanded="false" aria-label="Select project"></button>
                                    <ul className="custom-select-options" role="listbox">
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-7" role="option">Repair of an Electric Sander <span className="job-date">(Oct 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-3" role="option">Installation of a New Electrical Socket <span className="job-date">(May 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-4" role="option">Installed Down Lighting in a Shed <span className="job-date">(Mar 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-8" role="option">Smart Underfloor Heating Thermostat <span className="job-date">(Dec 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-1" role="option">Upgraded Downlights to LEDs and Installed Dimmer Switches <span className="job-date">(Nov 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-5" role="option">Installed a New Ceiling Light <span className="job-date">(Mar 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-9" role="option">Outdoor Socket Installation <span className="job-date">(Aug 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-10" role="option">Installed Smart Heating Controls <span className="job-date">(Jan 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-6" role="option">Upgraded Kitchen and Hallway Downlights to LEDs <span className="job-date">(Aug 2021)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-11" role="option">Installation of Dimmer Switch <span className="job-date">(Feb 2021)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-2" role="option">Dangerous Socket Removal and Blanking Plate Installation <span className="job-date">(Mar 2019)</span></button></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="job-panels-container">
                                <div className="job-panel" data-job="electrical-job-1">
                                    <div className="gallery-text">
                                        <p>Pulled out existing halogen lamps, removed 12-volt transformers, wired in energy-efficient LED bulbs, and replaced rocker switches on the wall with LED-compatible dimmers.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_lounge_ceiling_lights.webp" alt="LED Downlight Installation" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-2">
                                    <div className="gallery-text">
                                        <p>Removed a very rusty and dangerous electrical socket, made safe and installed a blanking plate including filling and redecorating around it.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_blanking_plate(1).webp" alt="Dangerous Socket Removal 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_blanking_plate(2).webp" alt="Dangerous Socket Removal 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_blanking_plate(3).webp" alt="Dangerous Socket Removal 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_blanking_plate(4).webp" alt="Dangerous Socket Removal 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_blanking_plate(5).webp" alt="Dangerous Socket Removal 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_blanking_plate(6).webp" alt="Dangerous Socket Removal 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_blanking_plate(7).webp" alt="Dangerous Socket Removal 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_blanking_plate(8).webp" alt="Dangerous Socket Removal 8" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-3">
                                    <div className="gallery-text">
                                        <p>Removed a smashed electrical socket and safely replaced it with a new one.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_socket_installation.webp" alt="Electrical Socket Installation" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-4">
                                    <div className="gallery-text">
                                        <p>Removed an inadequate single pendant lamp and replaced with 6 Halogen Downlights.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_shed_downlights(1).webp" alt="Shed Downlights Installation 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_shed_downlights(2).webp" alt="Shed Downlights Installation 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_shed_downlights(3).webp" alt="Shed Downlights Installation 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_shed_downlights(4).webp" alt="Shed Downlights Installation 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_shed_downlights(5).webp" alt="Shed Downlights Installation 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_shed_downlights(6).webp" alt="Shed Downlights Installation 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_shed_downlights(7).webp" alt="Shed Downlights Installation 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-5">
                                    <div className="gallery-text">
                                        <p>Removed an old ceiling light and installed a new one.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_ceiling_light.webp" alt="Ceiling Light Installation" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-6">
                                    <div className="gallery-text">
                                        <p>Removed transformers, and old bezels. Installed new energy efficient down lights with new bezels.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_downlight_upgrades(1).webp" alt="Downlight Upgrades 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_downlight_upgrades(2).webp" alt="Downlight Upgrades 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_downlight_upgrades(3).webp" alt="Downlight Upgrades 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_downlight_upgrades(4).webp" alt="Downlight Upgrades 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-7">
                                    <div className="gallery-text">
                                        <p>Repaired an electric sander that was faulty.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_sander_rewire.webp" alt="Electric Sander Repair" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-8">
                                    <div className="gallery-text">
                                        <p>Removed a malfunctioning under floor heating thermostat and installed a modern smart one.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_smart_underfloor.webp" alt="Smart Underfloor Heating Thermostat" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-9">
                                    <div className="gallery-text">
                                        <p>Installed a waterproof junction box and a smart waterproof double socket for outdoor lighting.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_outdoor_socket(1).webp" alt="Outdoor Socket Installation 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_outdoor_socket(2).webp" alt="Outdoor Socket Installation 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_outdoor_socket(3).webp" alt="Outdoor Socket Installation 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-10">
                                    <div className="gallery-text">
                                        <p>Installed a TADO Wireless Smart Thermostat Starter Kit.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_smart_heating_controls.webp" alt="Smart Heating Controls Installation" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-11">
                                    <div className="gallery-text">
                                        <p>Removed a traditional on off switch and replaced it with an LED compatible dimmer. Earthed it for safety.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_bedroom_dimmer(1).webp" alt="Dimmer Switch Installation 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/e/e_bedroom_dimmer(2).webp" alt="Dimmer Switch Installation 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gallery-panel landscaping">
                            <div className="custom-select-container">
                                <div className="custom-select" data-select-type="job" data-default-value="landscaping-job-2">
                                    <button type="button" className="custom-select-trigger" aria-expanded="false" aria-label="Select project"></button>
                                    <ul className="custom-select-options" role="listbox">
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-2" role="option">Pergola Sunbathing Platform <span className="job-date">(Nov 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-10" role="option">Cleaning and Oiling Decking <span className="job-date">(Mar 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-11" role="option">Wooden Planter Fascia <span className="job-date">(Feb 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-1" role="option">Concrete Base & Bike Anchor <span className="job-date">(Oct 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-8" role="option">Patch Repair Using Artificial Grass <span className="job-date">(Mar 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-4" role="option">Large Rockery and Waterfeature <span className="job-date">(Oct 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-13" role="option">Weed Membrane and Slate Chippings <span className="job-date">(Oct 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-7" role="option">Repaired and Restored a Garden Storage Unit <span className="job-date">(May 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-23" role="option">Re-flashing and Felting Brick Shed Roof <span className="job-date">(Oct 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-24" role="option">Bike Shed Reroof <span className="job-date">(Oct 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-25" role="option">Bike Shed and Trellis <span className="job-date">(Jun 2015)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-18" role="option">Patch Repairs on Decking <span className="job-date">(Apr 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-14" role="option">Garden Pond <span className="job-date">(Apr 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-3" role="option">Fence Repairs <span className="job-date">(Jul 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-5" role="option">General Garden Maintenance <span className="job-date">(Jul 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-6" role="option">Returfing a Section of Lawn <span className="job-date">(Jul 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-9" role="option">Garden Office <span className="job-date">(May 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-26" role="option">Outdoor Furniture Building <span className="job-date">(Apr 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-27" role="option">Installation of Garden Trellis <span className="job-date">(Mar 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-19" role="option">Installation of Decking Step <span className="job-date">(Sep 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-20" role="option">General Garden Clearance <span className="job-date">(Aug 2021)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-15" role="option">Installation of a Decking Path <span className="job-date">(Jun 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-16" role="option">Fencepost Repairs <span className="job-date">(Feb 2016)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-17" role="option">Dismantling of Brick Wall <span className="job-date">(Feb 2020)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-12" role="option">Grave Maintenance <span className="job-date">(Oct 2014)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-21" role="option">Garden Shed Upgrade to Beach Hut Style <span className="job-date">(May 2012)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="landscaping-job-22" role="option">Full Garden Renovation <span className="job-date">(Dec 2009)</span></button></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="job-panels-container">
                                <div className="job-panel" data-job="landscaping-job-4">
                                    <div className="gallery-text">
                                        <p>Built a rockery and installed a waterfall, including all of the pipework.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_rockery_waterfall(1).webp" alt="Large Rockery and Waterfeature 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_rockery_waterfall(2).webp" alt="Large Rockery and Waterfeature 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_rockery_waterfall(3).webp" alt="Large Rockery and Waterfeature 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_rockery_waterfall(4).webp" alt="Large Rockery and Waterfeature 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_rockery_waterfall(5).webp" alt="Large Rockery and Waterfeature 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_rockery_waterfall(6).webp" alt="Large Rockery and Waterfeature 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_rockery_waterfall(7).webp" alt="Large Rockery and Waterfeature 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_rockery_waterfall(8).webp" alt="Large Rockery and Waterfeature 8" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_rockery_waterfall(9).webp" alt="Large Rockery and Waterfeature 9" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_rockery_waterfall(10).webp" alt="Large Rockery and Waterfeature 10" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_rockery_waterfall(11).webp" alt="Large Rockery and Waterfeature 11" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_rockery_waterfall(12).webp" alt="Large Rockery and Waterfeature 12" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-8">
                                    <div className="gallery-text">
                                        <p>Cut out and removed an "I WILL NOT GROW!!!" area of real grass and replaced with an artificial turf patch.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_artifical_turf(1).webp" alt="Patch Repair Using Artificial Grass 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_artifical_turf(2).webp" alt="Patch Repair Using Artificial Grass 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-13">
                                    <div className="gallery-text">
                                        <p>Removed weeds from a front garden, laid a weed proof membrane and then slate chippings.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_slate_chippings(1).webp" alt="Weed Membrane and Slate Chippings 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_slate_chippings(2).webp" alt="Weed Membrane and Slate Chippings 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_slate_chippings(3).webp" alt="Weed Membrane and Slate Chippings 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_slate_chippings(4).webp" alt="Weed Membrane and Slate Chippings 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-7">
                                    <div className="gallery-text">
                                        <p>Deconstructed A tired storage unit, repaired rotten boards, preserved wood and reconstructed unit.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_storage_shed(1).webp" alt="Repaired and Restored a Garden Storage Unit 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_storage_shed(2).webp" alt="Repaired and Restored a Garden Storage Unit 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_storage_shed(3).webp" alt="Repaired and Restored a Garden Storage Unit 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_storage_shed(4).webp" alt="Repaired and Restored a Garden Storage Unit 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_storage_shed(5).webp" alt="Repaired and Restored a Garden Storage Unit 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_storage_shed(6).webp" alt="Repaired and Restored a Garden Storage Unit 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_storage_shed(7).webp" alt="Repaired and Restored a Garden Storage Unit 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-23">
                                    <div className="gallery-text">
                                        <p>Resealed lead flashing and laid fresh felt to waterproof a shed roof.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_brick_shed_roof(1).webp" alt="Re-flashing and Felting Brick Shed Roof 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_brick_shed_roof(2).webp" alt="Re-flashing and Felting Brick Shed Roof 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_brick_shed_roof(3).webp" alt="Re-flashing and Felting Brick Shed Roof 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_brick_shed_roof(4).webp" alt="Re-flashing and Felting Brick Shed Roof 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_brick_shed_roof(5).webp" alt="Re-flashing and Felting Brick Shed Roof 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_brick_shed_roof(6).webp" alt="Re-flashing and Felting Brick Shed Roof 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_brick_shed_roof(7).webp" alt="Re-flashing and Felting Brick Shed Roof 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-24">
                                    <div className="gallery-text">
                                        <p>Installed a new Onduline roof on a bike shed. Painted shed to preserve it.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_shed_reroof(1).webp" alt="Bike Shed Reroof 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_shed_reroof(2).webp" alt="Bike Shed Reroof 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_shed_reroof(3).webp" alt="Bike Shed Reroof 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_shed_reroof(4).webp" alt="Bike Shed Reroof 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_shed_reroof(5).webp" alt="Bike Shed Reroof 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-25">
                                    <div className="gallery-text">
                                        <p>Clearing area and adding foundation joists. Construction and Installation of a bike shed. Customised trellis to grow plants up and hide shed.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_shed_trellis(0.5).webp" alt="Bike Shed and Trellis 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_shed_trellis(1).webp" alt="Bike Shed and Trellis 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_shed_trellis(2).webp" alt="Bike Shed and Trellis 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_shed_trellis(3).webp" alt="Bike Shed and Trellis 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_shed_trellis(4).webp" alt="Bike Shed and Trellis 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-18">
                                    <div className="gallery-text">
                                        <p>Lifted old decking planks and removed rotten sections as well as rotten joists underneath. Installed new joists and new decking planks where needed.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_decking_patch_repairs(1).webp" alt="Patch Repairs on Decking 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_decking_patch_repairs(2).webp" alt="Patch Repairs on Decking 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_decking_patch_repairs(3).webp" alt="Patch Repairs on Decking 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_decking_patch_repairs(4).webp" alt="Patch Repairs on Decking 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-14">
                                    <div className="gallery-text">
                                        <p>Cleared all vegetation. Dug area. Installed pond. Surrounded by pebbles and fresh plants. Installed a fountain. Surrounded area with weed membrane and slate chippings.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pond(1).webp" alt="Garden Pond 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pond(2).webp" alt="Garden Pond 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pond(3).webp" alt="Garden Pond 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pond(4).webp" alt="Garden Pond 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pond(5).webp" alt="Garden Pond 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pond(6).webp" alt="Garden Pond 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pond(7).webp" alt="Garden Pond 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pond(8).webp" alt="Garden Pond 8" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pond(9).webp" alt="Garden Pond 9" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pond(10).webp" alt="Garden Pond 10" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pond(11).webp" alt="Garden Pond 11" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-3">
                                    <div className="gallery-text">
                                        <p>Removed rotten posts and installed new ones including waterproof membrane. Wedged non rotten posts back up to vertical.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_fencing(1).webp" alt="Fence Repairs 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_fencing(2).webp" alt="Fence Repairs 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_fencing(3).webp" alt="Fence Repairs 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_fencing(4).webp" alt="Fence Repairs 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-2">
                                    <div className="gallery-text">
                                        <p>Designed, built, and installed an 8-foot-tall pergola and solid platform. The platform is waterproofed on top, covered with Shockpad, and finished with high-quality artificial grass for a durable, low-maintenance sunbathing area.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(1).webp" alt="Pergola Sunbathing Platform 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(2).webp" alt="Pergola Sunbathing Platform 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(3).webp" alt="Pergola Sunbathing Platform 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(4).webp" alt="Pergola Sunbathing Platform 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(5).webp" alt="Pergola Sunbathing Platform 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(6).webp" alt="Pergola Sunbathing Platform 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(7).webp" alt="Pergola Sunbathing Platform 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(8).webp" alt="Pergola Sunbathing Platform 8" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(9).webp" alt="Pergola Sunbathing Platform 9" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(10).webp" alt="Pergola Sunbathing Platform 10" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(11).webp" alt="Pergola Sunbathing Platform 11" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(12).webp" alt="Pergola Sunbathing Platform 12" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(13).webp" alt="Pergola Sunbathing Platform 13" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(14).webp" alt="Pergola Sunbathing Platform 14" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(15).webp" alt="Pergola Sunbathing Platform 15" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(16).webp" alt="Pergola Sunbathing Platform 16" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_pergola(17).webp" alt="Pergola Sunbathing Platform 17" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-10">
                                    <div className="gallery-text">
                                        <p>Jet washed decking area. Refreshed and extended deck life with two coats of decking oil. This one always takes longer than you think it was going to!</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_decking_oil(1).webp" alt="Cleaning and Oiling Decking 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_decking_oil(2).webp" alt="Cleaning and Oiling Decking 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_decking_oil(3).webp" alt="Cleaning and Oiling Decking 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-11">
                                    <div className="gallery-text">
                                        <p>Constructed a bespoke wooden planter fascia to cover an ugly plastic planter. Built mainly from fencing feather edge strips.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_planter_fascia(1).webp" alt="Wooden Planter Fascia 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_planter_fascia(2).webp" alt="Wooden Planter Fascia 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_planter_fascia(3).webp" alt="Wooden Planter Fascia 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_planter_fascia(4).webp" alt="Wooden Planter Fascia 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-1">
                                    <div className="gallery-text">
                                        <p>Cut into the floor of an existing wooden bike shed, excavated earth underneath, filled with 20KG of concrete, drilled out and then installed a ground anchor.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_lock_anchor(1).webp" alt="Concrete Base & Bike Anchor 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_lock_anchor(2).webp" alt="Concrete Base & Bike Anchor 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_lock_anchor(2.5).webp" alt="Concrete Base & Bike Anchor 2.5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_lock_anchor(3).webp" alt="Concrete Base & Bike Anchor 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_lock_anchor(4).webp" alt="Concrete Base & Bike Anchor 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_bike_lock_anchor(5).webp" alt="Concrete Base & Bike Anchor 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-5">
                                    <div className="gallery-text">
                                        <p>Pruning and training creepers as well as refreshing glass of a lean to conservatory.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_outhouse_vines(1).webp" alt="General garden maintenance 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_outhouse_vines(2).webp" alt="General garden maintenance 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_outhouse_vines(3).webp" alt="General garden maintenance 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_outhouse_vines(4).webp" alt="General garden maintenance 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-6">
                                    <div className="gallery-text">
                                        <p>Removal Old weed strewn turf and neat installation of new turf.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_turf(1).webp" alt="Returfing a Section of Lawn 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_turf(2).webp" alt="Returfing a Section of Lawn 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_turf(3).webp" alt="Returfing a Section of Lawn 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-9">
                                    <div className="gallery-text">
                                        <p>Co-constructed a study base foundation and then built a garden office on top. From a kit rather than from scratch!</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_office(1).webp" alt="Garden Office 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_office(2).webp" alt="Garden Office 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_office(3).webp" alt="Garden Office 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_office(4).webp" alt="Garden Office 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_office(5).webp" alt="Garden Office 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_office(6).webp" alt="Garden Office 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_office(7).webp" alt="Garden Office 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-26">
                                    <div className="gallery-text">
                                        <p>Conversion from a box of bits to a comfortable outdoor sofa.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_outdoor_furnture(1).webp" alt="Outdoor Furniture Building 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_outdoor_furnture(2).webp" alt="Outdoor Furniture Building 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-27">
                                    <div className="gallery-text">
                                        <p>Removed old dead fence panels. Installed full six foot by 6 foot trellis panels. Also installed fence top trellis where panels didn't need removing.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_trellis(1).webp" alt="Installation of Garden Trellis 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_trellis(2).webp" alt="Installation of Garden Trellis 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_trellis(3).webp" alt="Installation of Garden Trellis 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_trellis(4).webp" alt="Installation of Garden Trellis 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_trellis(5).webp" alt="Installation of Garden Trellis 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-19">
                                    <div className="gallery-text">
                                        <p>Installed a large step made of decking to reduce the height change to an existing piece of decking.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_decking_step(1).webp" alt="Installation of Decking Step 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_decking_step(2).webp" alt="Installation of Decking Step 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_decking_step(3).webp" alt="Installation of Decking Step 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_decking_step(4).webp" alt="Installation of Decking Step 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_decking_step(5).webp" alt="Installation of Decking Step 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-20">
                                    <div className="gallery-text">
                                        <p>Cleared a mountain of Climbers and pruned huge plants to tidy up a house and garden.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_general_garden_clearance(1).webp" alt="General Garden Clearance 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_general_garden_clearance(2).webp" alt="General Garden Clearance 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_general_garden_clearance(3).webp" alt="General Garden Clearance 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-15">
                                    <div className="gallery-text">
                                        <p>Removed Old Broken stepping stone path. Installed joists, weed membrane new decking path.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_decking_path(1).webp" alt="Installation of a Decking Path 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_decking_path(2).webp" alt="Installation of a Decking Path 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_decking_path(3).webp" alt="Installation of a Decking Path 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_decking_path(4).webp" alt="Installation of a Decking Path 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_decking_path(5).webp" alt="Installation of a Decking Path 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_decking_path(6).webp" alt="Installation of a Decking Path 6" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_decking_path(7).webp" alt="Installation of a Decking Path 7" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_decking_path(8).webp" alt="Installation of a Decking Path 8" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_decking_path(9).webp" alt="Installation of a Decking Path 9" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_garden_decking_path(10).webp" alt="Installation of a Decking Path 10" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-16">
                                    <div className="gallery-text">
                                        <p>Dug rusted fence supports out of concrete. Installed new supports, new fence posts and reinstalled fence panels.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_fencepost_repairs(1).webp" alt="Fencepost Repairs 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_fencepost_repairs(2).webp" alt="Fencepost Repairs 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_fencepost_repairs(3).webp" alt="Fencepost Repairs 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_fencepost_repairs(4).webp" alt="Fencepost Repairs 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-17">
                                    <div className="gallery-text">
                                        <p>Safely removed all of the bricks from a wall that was falling down. Rerendered small exterior section of house wall. Repainted to match rest of household.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_brickwall_removal(1).webp" alt="Dismantling of Brick Wall 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_brickwall_removal(2).webp" alt="Dismantling of Brick Wall 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_brickwall_removal(3).webp" alt="Dismantling of Brick Wall 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_brickwall_removal(4).webp" alt="Dismantling of Brick Wall 4" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_brickwall_removal(5).webp" alt="Dismantling of Brick Wall 5" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-12">
                                    <div className="gallery-text">
                                        <p>Specialized grave maintenance and restoration work.</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_grave_maintenance.webp" alt="Grave Maintenance 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-21">
                                    <div className="gallery-text">
                                        <p>Definite garden jollification! Garden shed upgrade to beach hut style!</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_shed_paint(1).webp" alt="Garden Shed Upgrade to Beach Hut Style 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_shed_paint(2).webp" alt="Garden Shed Upgrade to Beach Hut Style 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="landscaping-job-22">
                                    <div className="gallery-text">
                                        <p>Sadly I can't find any more pictures but at least these show part transformation!</p>
                                    </div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_full_garden_job(1).webp" alt="Full Garden Renovation 1" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_full_garden_job(1.5).webp" alt="Full Garden Renovation 2" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                            <div className="carousel-slide"><img src="/OneManAndAToolbox/images/gmp/gmp_full_garden_job(2).webp" alt="Full Garden Renovation 3" /> <span className="expand-hint"><i className="fas fa-search-plus"></i><span className="hint-text"><span className="hint-touch">Touch</span><span className="hint-click">Click</span><br />Picture to<br />Expand</span></span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="testimonies">
                    <h2>Testimonials <span className="section-hint">Choose Category<br />of Work:</span></h2>
                    <div className="custom-select-container">
                        <div className="custom-select" data-select-type="testimonials" data-default-value="general" data-testimonial-target="#testimonials-list">
                            <button type="button" className="custom-select-trigger" aria-expanded="false" aria-label="Filter testimonials by service category"></button>
                            <ul className="custom-select-options" role="listbox">
                                <li><button type="button" className="custom-select-option" data-value="general" role="option" aria-selected="false">General Repairs &amp; Maintenance</button></li>
                                <li><button type="button" className="custom-select-option" data-value="plumbing" role="option" aria-selected="false">Minor Plumbing</button></li>
                                <li><button type="button" className="custom-select-option" data-value="decorating" role="option" aria-selected="false">Painting &amp; Decorating</button></li>
                                <li><button type="button" className="custom-select-option" data-value="carpentry" role="option" aria-selected="false">Carpentry &amp; Woodwork</button></li>
                                <li><button type="button" className="custom-select-option" data-value="electrical" role="option" aria-selected="false">Minor Electrical</button></li>
                                <li><button type="button" className="custom-select-option" data-value="landscaping" role="option" aria-selected="false">Garden Maintenance &amp; Projects</button></li>
                            </ul>
                        </div>
                    </div>
                    <div className="testimonials-slider" id="testimonials-list">
                        <div className="testimonial" data-category="general">
                            <p>"Prompt, polite, and transparent pricing—will definitely book again."</p>
                            <p><strong>Alexander R.</strong> <span className="testimonial-date">(April 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="general">
                            <p>"He fixed everything on our snag list in one visit and left the place spotless."</p>
                            <p><strong>Priya N.</strong> <span className="testimonial-date">(January 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="general">
                            <p>"Great service! Highly recommend for tricky general repairs."</p>
                            <p><strong>John Doe</strong> <span className="testimonial-date">(October 2023)</span></p>
                        </div>

                        <div className="testimonial" data-category="plumbing">
                            <p>"Diagnosed a pressure issue others missed and solved it the same day."</p>
                            <p><strong>Tom H.</strong> <span className="testimonial-date">(May 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="plumbing">
                            <p>"New kitchen tap and waste fitted perfectly with zero mess."</p>
                            <p><strong>Kelly W.</strong> <span className="testimonial-date">(February 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="plumbing">
                            <p>"Fast response to a leak and a tidy plumbing fix—life saver!"</p>
                            <p><strong>Mike Johnson</strong> <span className="testimonial-date">(December 2023)</span></p>
                        </div>

                        <div className="testimonial" data-category="decorating">
                            <p>"Careful prep and crisp edges throughout the whole flat—impressive!"</p>
                            <p><strong>Ben &amp; Maria</strong> <span className="testimonial-date">(June 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="decorating">
                            <p>"Feature wall wallpapered with perfect pattern matching."</p>
                            <p><strong>Lucy P.</strong> <span className="testimonial-date">(March 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="decorating">
                            <p>"Excellent painting and decorating—our lounge looks brand new."</p>
                            <p><strong>Jane Smith</strong> <span className="testimonial-date">(November 2023)</span></p>
                        </div>

                        <div className="testimonial" data-category="carpentry">
                            <p>"He restored our creaky staircase without replacing everything—brilliant."</p>
                            <p><strong>Helen D.</strong> <span className="testimonial-date">(July 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="carpentry">
                            <p>"Our fitted wardrobe now has smart storage we actually enjoy using."</p>
                            <p><strong>Omar K.</strong> <span className="testimonial-date">(April 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="carpentry">
                            <p>"Impressed with the custom shelving and carpentry craftsmanship."</p>
                            <p><strong>Sarah Lee</strong> <span className="testimonial-date">(January 2024)</span></p>
                        </div>

                        <div className="testimonial" data-category="electrical">
                            <p>"Smart thermostat installed and configured so we finally understand it."</p>
                            <p><strong>Sophie T.</strong> <span className="testimonial-date">(June 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="electrical">
                            <p>"New lighting plan transformed our kitchen—neat wiring and no fuss."</p>
                            <p><strong>Gareth B.</strong> <span className="testimonial-date">(May 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="electrical">
                            <p>"Minor electrical upgrades were done safely and on schedule."</p>
                            <p><strong>Emily Clark</strong> <span className="testimonial-date">(March 2024)</span></p>
                        </div>

                        <div className="testimonial" data-category="landscaping">
                            <p>"Re-levelled our lawn and added drainage so it finally survives winter."</p>
                            <p><strong>Martin P.</strong> <span className="testimonial-date">(August 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="landscaping">
                            <p>"Built a cedar planter bench that’s both sturdy and beautiful."</p>
                            <p><strong>Ana &amp; Chris</strong> <span className="testimonial-date">(April 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="landscaping">
                            <p>"Top-notch garden refresh—our patio and planters look amazing."</p>
                            <p><strong>David Kim</strong> <span className="testimonial-date">(February 2024)</span></p>
                        </div>
                    </div>
                </section>

                <section id="about">
                    <h2>About Me</h2>
                    <img src="/OneManAndAToolbox/images/OneManAndAToolBox.webp" alt="Friendly Handyman" />
                    <p style={{ textAlign: 'left' }}>I'm your local, reliable handyman dedicated to providing high-quality work with a friendly and professional attitude. With a passion for fixing things and helping people, no job is too small. I pride myself on being tidy, punctual, and ensuring you're happy with the result.</p>
                </section>

                <section id="area">
                    <h2>Service Area</h2>
                    <div className="postcode-tags">
                        <span>W5</span>
                        <span>W13</span>
                        <span>W7</span>
                        <span>TW8</span>
                    </div>
                    <div className="map-container">
                        <iframe src="https://www.google.com/maps/d/u/0/embed?mid=1HcJj6yuP_cij_hniMuvJJmWnhKC3H3I&ehbc=2E312F&noprof=1&z=12" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </section>

                <section id="contact">
                    <h2>Get In Touch</h2>
                    <p>Have a job that needs doing? Contact me for a free quote!</p>
                    <p><strong><img src="/OneManAndAToolbox/whatsapp.webp" alt="WhatsApp" className="contact-icon" /> WhatsApp:</strong> <a href="https://wa.me/447902251152" target="_blank" rel="noopener noreferrer" className="contact-link">Message me</a></p>
                    <p><strong><img src="/OneManAndAToolbox/whatsapp.webp" alt="WhatsApp" className="contact-icon" /> WhatsApp Call:</strong> <a href="whatsapp://call?phone=+447902251152" target="_blank" rel="noopener noreferrer" className="contact-link">Call me</a></p>
                    <p><strong>✉️ Email:</strong> <a href="mailto:onemanandatoolboxuk@gmail.com" className="contact-link">onemanandatoolboxuk@gmail.com</a></p>
                    <p><strong>📞 Call:</strong> <a href="tel:07902251152" className="contact-link">07902 251152</a></p>

                    <div style={{ textAlign: 'center', padding: '10px', background: '#2c3e50', color: '#fff', borderRadius: '12px' }}>
                        <p>&copy; 2026 One Man and a Toolbox</p>
                    </div>
                </section>
            </div>

            <div id="lightbox" className="lightbox" aria-hidden="true">
                <div className="lightbox-content"></div>
                <span className="contract-hint"><i className="fas fa-compress-arrows-alt"></i> <span className="hint-touch">Touch</span><span className="hint-click">Click</span> to Close</span>
                <button type="button" className="lightbox-arrow arrow-prev" aria-label="Previous image">‹</button>
                <button type="button" className="lightbox-arrow arrow-next" aria-label="Next image">›</button>
                <div className="lightbox-counter"></div>
            </div>
        </>
    );
}
