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

        // Detect interaction mode: prioritize "fine" pointers (mouse/trackpad) for hybrid devices
        const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
        const isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && !hasFinePointer;
        
        if (isTouchDevice) {
            document.body.classList.add('touch-device');
            document.body.classList.remove('no-touch-device');
        } else {
            document.body.classList.add('no-touch-device');
            document.body.classList.remove('touch-device');
        }

        const setCarouselBackgrounds = () => {
            const carousels = document.querySelectorAll('.gallery-carousel');
            carousels.forEach(carousel => {
                const firstImage = carousel.querySelector('.carousel-slide img');
                if (firstImage?.src) {
                    // Extract relative path to ensure it works in both environments
                    const url = new URL(firstImage.src);
                    carousel.style.setProperty('--carousel-bg-image', `url("${url.pathname}")`);
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
                        // Reset scroll position to the first image
                        const track = panel.querySelector('.carousel-track');
                        if (track) track.scrollLeft = 0;
                        
                        // Update background for this carousel
                        const carousel = panel.querySelector('.gallery-carousel');
                        const firstImage = panel.querySelector('.carousel-slide img');
                        if (carousel && firstImage?.src) {
                            const url = new URL(firstImage.src);
                            carousel.style.setProperty('--carousel-bg-image', `url("${url.pathname}")`);
                        }
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

        customSelects.forEach(initCustomSelect);
        setCarouselBackgrounds();
        initCarouselArrows();
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
            lightboxTrack.style.transform = `translateX(${offset}vw)`;

            lightboxCounter.textContent = `${index + 1} / ${currentLightboxImages.length}`;

            // Hide/show arrows at boundaries
            prevBtn.style.display = index === 0 ? 'none' : 'block';
            nextBtn.style.display = index === currentLightboxImages.length - 1 ? 'none' : 'block';
        };

        const openLightbox = (images, startIndex) => {
            currentLightboxImages = images;
            currentLightboxIndex = startIndex;
            
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

            // Set initial position immediately before opening
            const offset = -startIndex * 100;
            lightboxTrack.style.transform = `translateX(${offset}vw)`;
            lightboxCounter.textContent = `${startIndex + 1} / ${currentLightboxImages.length}`;
            prevBtn.style.display = startIndex === 0 ? 'none' : 'block';
            nextBtn.style.display = startIndex === currentLightboxImages.length - 1 ? 'none' : 'block';

            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            positionLightboxArrows();
            window.addEventListener('resize', positionLightboxArrows);
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
            const clickedImg = e.target.closest('.carousel-slide img');
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
            touchEndX = touchStartX; // Reset to match start
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
                    <img src={`${basePath}images/toolboxlogo.png`} alt="Toolbox Logo" />
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
                        <img src={`${basePath}images/toolboxlogo.png`} alt="One Man and a Toolbox logo" className="hero-logo" />
                        <h2>Your Friendly & Reliable Local Handyman</h2>
                        <p>For all the odd jobs and repairs around your home in parts of W5, W13, W7 & TW8.</p>
                    </div>
                </section>

                <section id="services">
                    <h2>My Services</h2>
                    <div className="services-grid">
                        <div className="service">
                            <i className="fas fa-wrench"></i>
                            <h3>General Repairs & Small Jobs</h3>
                            <p>Flat-Pack assembly, mirrors and pictures, blinds, doors & locks, painting & decorating, flooring.</p>
                        </div>
                        <div className="service">
                            <i className="fas fa-tint"></i>
                            <h3>Minor Plumbing</h3>
                            <p>Tap upgrades, toilet flush systems, washing machine plumbing, waste pipes, cubicle showers.</p>
                        </div>
                        <div className="service">
                            <i className="fas fa-bolt"></i>
                            <h3>Minor Electrical</h3>
                            <p>LED lighting upgrades, smart heating, socket replacements, dimmer switches.</p>
                        </div>
                        <div className="service">
                            <i className="fas fa-tools"></i>
                            <h3>Carpentry & Woodwork</h3>
                            <p>Bespoke shelving, upcycling loved items, custom furniture builds, storage solutions.</p>
                        </div>
                        <div className="service">
                            <i className="fas fa-leaf"></i>
                            <h3>Outdoor & Garden Work</h3>
                            <p>Fencing, trellis, sheds, decking, weed membranes, small paths, rockeries, bespoke planters, furniture repairs and assembly, pergolas, general maintenance.</p>
                        </div>
                    </div>
                </section>

                <section id="gallery">
                    <h2>Gallery <span className="title-hint">[<span className="hint-touch">👆</span><span className="hint-click">🖱️</span> to <span style={{ position: 'relative', display: 'inline-block', verticalAlign: 'middle', width: '1em', height: '1em' }}><i className="fas fa-search" style={{ position: 'absolute', top: 0, left: 0, fontSize: '1em' }}></i><span style={{ position: 'absolute', top: '32%', left: '41%', transform: 'translate(-50%, -50%)', fontSize: '0.45em', fontWeight: '900' }}>±</span></span>]</span></h2>
                    <input type="radio" id="general-radio" name="gallery" defaultChecked style={{ display: 'none' }} />
                    <input type="radio" id="plumbing-radio" name="gallery" style={{ display: 'none' }} />
                    <input type="radio" id="electrical-radio" name="gallery" style={{ display: 'none' }} />
                    <input type="radio" id="carpentry-radio" name="gallery" style={{ display: 'none' }} />
                    <input type="radio" id="garden-radio" name="gallery" style={{ display: 'none' }} />
                    <div className="custom-select-container">
                        <div className="custom-select" data-select-type="gallery" data-default-value="general">
                            <button type="button" className="custom-select-trigger" aria-expanded="false" aria-label="Select project type"></button>
                            <ul className="custom-select-options" role="listbox">
                                <li>
                                    <button type="button" className="custom-select-option" data-value="general" role="option" aria-selected="false">General Repairs &amp; Small Jobs</button>
                                </li>
                                <li>
                                    <button type="button" className="custom-select-option" data-value="plumbing" role="option" aria-selected="false">Minor Plumbing</button>
                                </li>
                                <li>
                                    <button type="button" className="custom-select-option" data-value="electrical" role="option" aria-selected="false">Minor Electrical</button>
                                </li>
                                <li>
                                    <button type="button" className="custom-select-option" data-value="carpentry" role="option" aria-selected="false">Carpentry &amp; Woodwork</button>
                                </li>
                                <li>
                                    <button type="button" className="custom-select-option" data-value="garden" role="option" aria-selected="false">Outdoor &amp; Garden Work</button>
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
                                        <li><button type="button" className="custom-select-option" data-value="general-job-1" role="option">Day Bed Construction <span className="job-date">(Sep 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-2" role="option">Coving <span className="job-date">(Aug 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-3" role="option">Bathroom Windows Frosting <span className="job-date">(Mar 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-4" role="option">Ottoman Bed <span className="job-date">(Nov 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-5" role="option">Flat Pack Wardrobe Reconstruction <span className="job-date">(Nov 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-6" role="option">Very Heavy Mirror <span className="job-date">(Nov 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-7" role="option">Electric Sander Repair <span className="job-date">(Oct 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-8" role="option">Damp Seal and Wall Painting <span className="job-date">(Oct 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-9" role="option">BBQ Construction <span className="job-date">(Dec 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-10" role="option">Door Planing <span className="job-date">(Nov 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-11" role="option">Bathroom Redecoration <span className="job-date">(Sep 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-12" role="option">Bathroom Partial Redecoration <span className="job-date">(Aug 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-13" role="option">Surfboard Ding Repair <span className="job-date">(May 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-14" role="option">Cubicle Toilet Redecoration <span className="job-date">(Mar 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-15" role="option">Vinyl Flooring <span className="job-date">(Jan 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-16" role="option">Bedroom Wall Repair <span className="job-date">(Aug 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-17" role="option">Letterbox Installation <span className="job-date">(Mar 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-18" role="option">Back Door Lock Installation <span className="job-date">(Feb 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-19" role="option">Roller Blinds <span className="job-date">(Aug 2021)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-20" role="option">Flat Pack Wardrobe <span className="job-date">(Mar 2021)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-21" role="option">Midsleeper Bed Assembly <span className="job-date">(Nov 2020)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-22" role="option">Exterior Window Sills <span className="job-date">(Jul 2019)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-23" role="option">Sideboard Restoration <span className="job-date">(Jun 2019)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-24" role="option">Radiator Cover <span className="job-date">(May 2019)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-25" role="option">Dining Chair Reupholstery <span className="job-date">(Jan 2018)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-26" role="option">Toddler Cot Assembly <span className="job-date">(Oct 2016)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-27" role="option">IKEA Kallax Shelving Unit <span className="job-date">(Jul 2015)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-28" role="option">Cat Flap Installation <span className="job-date">(Mar 2015)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-29" role="option">Wine Rack Installation <span className="job-date">(Aug 2014)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-30" role="option">Footstool Reupholstery <span className="job-date">(Jul 2014)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-31" role="option">Ceiling Repair <span className="job-date">(Apr 2014)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="general-job-32" role="option">Baby Cot Refurbishment <span className="job-date">(Apr 2014)</span></button></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="job-panels-container">
                                <div className="job-panel active" data-job="general-job-1">
                                    <div className="gallery-text"><p>I&#x27;d love to claim that I designed it, but I just put it together!</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_daybed(1).webp`} alt="Day Bed Construction 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_daybed(2).webp`} alt="Day Bed Construction 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_daybed(3).webp`} alt="Day Bed Construction 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_daybed(4).webp`} alt="Day Bed Construction 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_daybed(5).webp`} alt="Day Bed Construction 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_daybed(6).webp`} alt="Day Bed Construction 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_daybed(7).webp`} alt="Day Bed Construction 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_daybed(8).webp`} alt="Day Bed Construction 8" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-2">
                                    <div className="gallery-text"><p>Installed and redecorated a piece of fallen coving.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_coving(1).webp`} alt="Coving 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_coving(2).webp`} alt="Coving 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_coving(3).webp`} alt="Coving 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_coving(4).webp`} alt="Coving 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-3">
                                    <div className="gallery-text"><p>Fitted stained glass frosting to upper bathroom windows.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_window_frosting(1).webp`} alt="Bathroom Windows Frosting 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_window_frosting(2).webp`} alt="Bathroom Windows Frosting 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_window_frosting(3).webp`} alt="Bathroom Windows Frosting 3" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-4">
                                    <div className="gallery-text"><p>Disassembled, transported, and reassembled in a tight space.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_ottoman(1).webp`} alt="Ottoman Bed 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_ottoman(2).webp`} alt="Ottoman Bed 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_ottoman(3).webp`} alt="Ottoman Bed 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_ottoman(4).webp`} alt="Ottoman Bed 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_ottoman(5).webp`} alt="Ottoman Bed 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_ottoman(6).webp`} alt="Ottoman Bed 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_ottoman(7).webp`} alt="Ottoman Bed 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_ottoman(8).webp`} alt="Ottoman Bed 8" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_ottoman(9).webp`} alt="Ottoman Bed 9" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-5">
                                    <div className="gallery-text"><p>Rebuilt a flat pack wardrobe in a tight space after a house move.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_wardrobe_flatpack(1).webp`} alt="Flat Pack Wardrobe Reconstruction 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_wardrobe_flatpack(2).webp`} alt="Flat Pack Wardrobe Reconstruction 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_wardrobe_flatpack(3).webp`} alt="Flat Pack Wardrobe Reconstruction 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_wardrobe_flatpack(4).webp`} alt="Flat Pack Wardrobe Reconstruction 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_wardrobe_flatpack(5).webp`} alt="Flat Pack Wardrobe Reconstruction 5" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-6">
                                    <div className="gallery-text"><p>Hanging a mirror where anything other than perfect symmetry would look terrible. As Austin Powers once said, &quot;I needed a LASER&quot;.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_mirror_hanging(1).webp`} alt="Very Heavy Mirror 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_mirror_hanging(2).webp`} alt="Very Heavy Mirror 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-7">
                                    <div className="gallery-text"><p>Repaired an electric sander that was faulty.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/e_sander_rewire.webp`} alt="Electric Sander Repair" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-8">
                                    <div className="gallery-text"><p>Damp sealed and repainted the walls up to a loft room after a roofing leak.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_staircase_walls.webp`} alt="Damp Seal and Wall Painting" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-9">
                                    <div className="gallery-text"><p>Assembled a 4-burner gas barbecue.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_bbq.webp`} alt="BBQ Construction" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-10">
                                    <div className="gallery-text"><p>Unjamming doors using an electric plane to shave off to a smooth finish.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_door_planing.webp`} alt="Door Planing" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-11">
                                    <div className="gallery-text"><p>Full redecoration of a small bathroom.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_redec(1).webp`} alt="Bathroom Redecoration 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_redec(2).webp`} alt="Bathroom Redecoration 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_redec(3).webp`} alt="Bathroom Redecoration 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_redec(4).webp`} alt="Bathroom Redecoration 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_redec(5).webp`} alt="Bathroom Redecoration 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_redec(6).webp`} alt="Bathroom Redecoration 6" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-12">
                                    <div className="gallery-text"><p>Water damage from penetrating damp caused damage to the paintwork. Filled, damp sealed and repainted.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_paint(1).webp`} alt="Bathroom Partial Redecoration 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_paint(2).webp`} alt="Bathroom Partial Redecoration 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_paint(3).webp`} alt="Bathroom Partial Redecoration 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_paint(4).webp`} alt="Bathroom Partial Redecoration 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_paint(5).webp`} alt="Bathroom Partial Redecoration 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_paint(6).webp`} alt="Bathroom Partial Redecoration 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_paint(7).webp`} alt="Bathroom Partial Redecoration 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_paint(8).webp`} alt="Bathroom Partial Redecoration 8" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_bathroom_paint(9).webp`} alt="Bathroom Partial Redecoration 9" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-13">
                                    <div className="gallery-text"><p>Removed damage resin. Replaced with fresh resin to seal the board. Sanded to shape. Repainted.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_surfboard(1).webp`} alt="Surfboard Ding Repair 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_surfboard(2).webp`} alt="Surfboard Ding Repair 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_surfboard(3).webp`} alt="Surfboard Ding Repair 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_surfboard(4).webp`} alt="Surfboard Ding Repair 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-14">
                                    <div className="gallery-text"><p>Full redecoration including staining door, wall paper stripping, filling, sanding, and painting.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_toilet_redecoration(1).webp`} alt="Cubicle Toilet Redecoration 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_toilet_redecoration(2).webp`} alt="Cubicle Toilet Redecoration 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_toilet_redecoration(3).webp`} alt="Cubicle Toilet Redecoration 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_toilet_redecoration(4).webp`} alt="Cubicle Toilet Redecoration 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_toilet_redecoration(5).webp`} alt="Cubicle Toilet Redecoration 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_toilet_redecoration(6).webp`} alt="Cubicle Toilet Redecoration 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_toilet_redecoration(7).webp`} alt="Cubicle Toilet Redecoration 7" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-15">
                                    <div className="gallery-text"><p>Removed old carpet and grippers. Cut and installed new vinyl. Installed oak door threshold.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_toilet_flooring(1).webp`} alt="Vinyl Flooring 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_toilet_flooring(2).webp`} alt="Vinyl Flooring 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_toilet_flooring(3).webp`} alt="Vinyl Flooring 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_toilet_flooring(4).webp`} alt="Vinyl Flooring 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_toilet_flooring(5).webp`} alt="Vinyl Flooring 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_toilet_flooring(6).webp`} alt="Vinyl Flooring 6" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-16">
                                    <div className="gallery-text"><p>Sanded down, sealed and repainted bedroom wall after roof leak</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_partial_bedroom_redec(1).webp`} alt="Bedroom wall repair 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_partial_bedroom_redec(2).webp`} alt="Bedroom wall repair 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_partial_bedroom_redec(3).webp`} alt="Bedroom wall repair 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_partial_bedroom_redec(4).webp`} alt="Bedroom wall repair 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-17">
                                    <div className="gallery-text"><p>Removed the old corroded letterbox and installed both a new external and an internal letterbox.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_letterbox(1).webp`} alt="Letterbox 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_letterbox(2).webp`} alt="Letterbox 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_letterbox(3).webp`} alt="Letterbox 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_letterbox(4).webp`} alt="Letterbox 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-18">
                                    <div className="gallery-text"><p>Removed a broken back door lock and installed a new British Standard back. Also installed a high bolt for extra security.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_backdoor_lock(1).webp`} alt="Back Door Lock 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_backdoor_lock(2).webp`} alt="Back Door Lock 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_backdoor_lock(3).webp`} alt="Back Door Lock 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_backdoor_lock(4).webp`} alt="Back Door Lock 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-19">
                                    <div className="gallery-text"><p>Installed blackout roller blinds.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_blinds(1).webp`} alt="Roller Blinds 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_blinds(2).webp`} alt="Roller Blinds 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-20">
                                    <div className="gallery-text"><p>Assembled a single mirror wardrobe.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_wardrobe.webp`} alt="Flat Pack Wardrobe 1" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-21">
                                    <div className="gallery-text"><p>Assembled a midsleeper bed.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_midsleeper.webp`} alt="Midsleeper Bed 1" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-22">
                                    <div className="gallery-text"><p>Sanded down, filled cracks and repainted.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_windowsills.webp`} alt="Exterior Window Sills 1" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-23">
                                    <div className="gallery-text"><p>Full refurbishment of an old sideboard</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_sideboard_restoration(1).webp`} alt="Sideboard 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_sideboard_restoration(2).webp`} alt="Sideboard 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_sideboard_restoration(3).webp`} alt="Sideboard 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_sideboard_restoration(4).webp`} alt="Sideboard 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_sideboard_restoration(5).webp`} alt="Sideboard 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_sideboard_restoration(6).webp`} alt="Sideboard 6" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-24">
                                    <div className="gallery-text"><p>Repainted radiator cover.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_radiator_cover.webp`} alt="Radiator Cover 1" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-25">
                                    <div className="gallery-text"><p>Removed old upholstery. Sourced custom cut high density foam. Reupholstered seats.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_reupholstery_dining_chairs(1).webp`} alt="Dining Chairs 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_reupholstery_dining_chairs(2).webp`} alt="Dining Chairs 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_reupholstery_dining_chairs(3).webp`} alt="Dining Chairs 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_reupholstery_dining_chairs(4).webp`} alt="Dining Chairs 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-26">
                                    <div className="gallery-text"><p>Assembled a toddler cot.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_toddler_cot(1).webp`} alt="Toddler Cot Assembly 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_toddler_cot(2).webp`} alt="Toddler Cot Assembly 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-27">
                                    <div className="gallery-text"><p>Assembled shelving unit.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_ikea_shelving.webp`} alt="IKEA Kallax Shelving Unit 1" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-28">
                                    <div className="gallery-text"><p>Installed a micro chip activated cat flap in a garden door.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_catflap.webp`} alt="Cat Flap 1" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-29">
                                    <div className="gallery-text"><p>Assembled wine rack and installed on wall.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_wine_rack(1).webp`} alt="Wine Rack Installation 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_wine_rack (2).webp`} alt="Wine Rack Installation 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-30">
                                    <div className="gallery-text"><p>Replaced tired foam and worn through material with custom cut high density foam and new covering.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_reupholstery(1).webp`} alt="Footstool Reupholstery 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_reupholstery(2).webp`} alt="Footstool Reupholstery 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-31">
                                    <div className="gallery-text"><p>Repaired cracks and repainted ceiling </p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/pd_ceiling_repaint.webp`} alt="Ceiling 1" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="general-job-32">
                                    <div className="gallery-text"><p>Refurbished and reassembled baby cot.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/general/grm_cot.webp`} alt="Baby Cot Refurbishment 1" /></div>
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
                                        <li><button type="button" className="custom-select-option" data-value="plumbing-job-1" role="option">Dual Flush <span className="job-date">(Sep 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="plumbing-job-2" role="option">Washing Machine <span className="job-date">(Jul 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="plumbing-job-3" role="option">Toilet <span className="job-date">(Jul 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="plumbing-job-4" role="option">Bathroom Sink <span className="job-date">(Mar 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="plumbing-job-5" role="option">Bathroom Tap <span className="job-date">(Jun 2018)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="plumbing-job-6" role="option">Dual Flush <span className="job-date">(May 2018)</span></button></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="job-panels-container">
                                <div className="job-panel active" data-job="plumbing-job-1">
                                    <div className="gallery-text"><p>Installed a new dual flush system and reconnected all pipes ensuring no leaks.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_installing_dual flush(1).webp`} alt="Dual Flush 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_installing_dual flush(2).webp`} alt="Dual Flush 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_installing_dual flush(3).webp`} alt="Dual Flush 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_installing_dual flush(4).webp`} alt="Dual Flush 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="plumbing-job-2">
                                    <div className="gallery-text"><p>Plumbed in new waste piping (internal and external) and made a simple platform to repair the damaged floor.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_washing_machine_waste(1).webp`} alt="Washing Machine 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_washing_machine_waste(2).webp`} alt="Washing Machine 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_washing_machine_waste(3).webp`} alt="Washing Machine 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_washing_machine_waste(4).webp`} alt="Washing Machine 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_washing_machine_waste(5).webp`} alt="Washing Machine 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_washing_machine_waste(6).webp`} alt="Washing Machine 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_washing_machine_waste(7).webp`} alt="Washing Machine 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_washing_machine_waste(8).webp`} alt="Washing Machine 8" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_washing_machine_waste(9).webp`} alt="Washing Machine 9" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_washing_machine_waste(10).webp`} alt="Washing Machine 10" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="plumbing-job-3">
                                    <div className="gallery-text"><p>Installation of a new toilet and all associated plumbing work.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_toilet_installation(1).webp`} alt="Toilet 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_toilet_installation(2).webp`} alt="Toilet 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_toilet_installation(3).webp`} alt="Toilet 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_toilet_installation(4).webp`} alt="Toilet 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="plumbing-job-4">
                                    <div className="gallery-text"><p>Replaced old taps and rigid piping with modern mixer tap, soap dispenser and flexible pipes with safety stopvalves.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_bathroom_sink(1).webp`} alt="Bathroom Sink 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_bathroom_sink(1.5).webp`} alt="Bathroom Sink 1.5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_bathroom_sink(2).webp`} alt="Bathroom Sink 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_bathroom_sink(3).webp`} alt="Bathroom Sink 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_bathroom_sink(4).webp`} alt="Bathroom Sink 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_bathroom_sink(5).webp`} alt="Bathroom Sink 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_bathroom_sink(6).webp`} alt="Bathroom Sink 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_bathroom_sink(7).webp`} alt="Bathroom Sink 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_bathroom_sink(8).webp`} alt="Bathroom Sink 8" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_bathroom_sink(9).webp`} alt="Bathroom Sink 9" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="plumbing-job-5">
                                    <div className="gallery-text"><p>Removed and replaced leaky tap and associated plumbing .</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_bathroom_tap(1).webp`} alt="Bathroom Tap 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_bathroom_tap(2).webp`} alt="Bathroom Tap 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="plumbing-job-6">
                                    <div className="gallery-text"><p>Installed a new dual flush system and reconnected all pipes ensuring no leaks.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_dual_flush(0.4).webp`} alt="Dual Flush 0.4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_dual_flush(0.8).webp`} alt="Dual Flush 0.8" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_dual_flush(1).webp`} alt="Dual Flush 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_dual_flush(2).webp`} alt="Dual Flush 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_dual_flush(3).webp`} alt="Dual Flush 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/plumbing/p_dual_flush(4).webp`} alt="Dual Flush 4" /></div>
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
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-1" role="option">Ceiling Light <span className="job-date">(Mar 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-2" role="option">Electrical Socket <span className="job-date">(May 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-3" role="option">Shed Lighting <span className="job-date">(Mar 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-4" role="option">Smart Underfloor Heating Thermostat <span className="job-date">(Dec 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-5" role="option">Lounge Ceiling Lights <span className="job-date">(Nov 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-6" role="option">Downlight Upgrades <span className="job-date">(Oct 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-7" role="option">Ceiling Light <span className="job-date">(Mar 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-8" role="option">Outdoor Socket <span className="job-date">(Aug 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-9" role="option">Smart Heating Controls <span className="job-date">(Jan 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-10" role="option">Dimmer Switch <span className="job-date">(Feb 2021)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="electrical-job-11" role="option">Dangerous Socket Removal <span className="job-date">(Mar 2019)</span></button></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="job-panels-container">
                                <div className="job-panel active" data-job="electrical-job-1">
                                    <div className="gallery-text"><p>Removed a pendant light and replaced with a spotlight set</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_landing_ceiling_light.webp`} alt="Ceiling Light 1" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-2">
                                    <div className="gallery-text"><p>Removed a smashed electrical socket and safely replaced it with a new one.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_socket_installation.webp`} alt="Electrical Socket 1" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-3">
                                    <div className="gallery-text"><p>Installed 6 Halogen Downlights in a shed, replacing an inadequate pendant light</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_shed_downlights(1).webp`} alt="Shed Lighting 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_shed_downlights(2).webp`} alt="Shed Lighting 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_shed_downlights(3).webp`} alt="Shed Lighting 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_shed_downlights(4).webp`} alt="Shed Lighting 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_shed_downlights(5).webp`} alt="Shed Lighting 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_shed_downlights(6).webp`} alt="Shed Lighting 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_shed_downlights(7).webp`} alt="Shed Lighting 7" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-4">
                                    <div className="gallery-text"><p>Removed a malfunctioning underfloor heating thermostat and installed a modern smart one.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_smart_underfloor(1).webp`} alt="Smart Underfloor Heating Thermostat 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_smart_underfloor(2).webp`} alt="Smart Underfloor Heating Thermostat 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-5">
                                    <div className="gallery-text"><p>Wired in energy-efficient LED bulbs and replaced wall switches with LED-compatible dimmers.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_lounge_ceiling_lights(1).webp`} alt="Lounge Ceiling Lights 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_lounge_ceiling_lights(2).webp`} alt="Lounge Ceiling Lights 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_lounge_ceiling_lights(3).webp`} alt="Lounge Ceiling Lights 3" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-6">
                                    <div className="gallery-text"><p>Installed new energy efficient downlights with new bezels.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_downlight_upgrades(0.5).webp`} alt="Downlight Upgrades 0.5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_downlight_upgrades(1).webp`} alt="Downlight Upgrades 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_downlight_upgrades(1.5).webp`} alt="Downlight Upgrades 1.5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_downlight_upgrades(2).webp`} alt="Downlight Upgrades 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_downlight_upgrades(3).webp`} alt="Downlight Upgrades 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_downlight_upgrades(4).webp`} alt="Downlight Upgrades 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-7">
                                    <div className="gallery-text"><p>Removed an old ceiling light and installed a new one.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_ceiling_light(1).webp`} alt="Ceiling Light 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_ceiling_light(2).webp`} alt="Ceiling Light 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_ceiling_light(3).webp`} alt="Ceiling Light 3" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-8">
                                    <div className="gallery-text"><p>Installed a smart waterproof double socket for outdoor lighting.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_outdoor_socket(0.4).webp`} alt="Outdoor Socket 0.4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_outdoor_socket(0.8).webp`} alt="Outdoor Socket 0.8" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_outdoor_socket(1).webp`} alt="Outdoor Socket 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_outdoor_socket(2).webp`} alt="Outdoor Socket 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_outdoor_socket(3).webp`} alt="Outdoor Socket 3" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-9">
                                    <div className="gallery-text"><p>Installed a TADO Wireless Smart Thermostat Starter Kit and Radiator Thermostats</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_smart_heating_controls(1).webp`} alt="Smart Heating Controls 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_smart_heating_controls(2).webp`} alt="Smart Heating Controls 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_smart_heating_controls(3).webp`} alt="Smart Heating Controls 3" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-10">
                                    <div className="gallery-text"><p>Removed traditional switch and replaced with LED compatible dimmer.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_bedroom_dimmer(1).webp`} alt="Dimmer Switch 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_bedroom_dimmer(2).webp`} alt="Dimmer Switch 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="electrical-job-11">
                                    <div className="gallery-text"><p>Removed a dangerous electrical socket, made safe and installed a blanking plate.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_blanking_plate(1).webp`} alt="Dangerous Socket Removal 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_blanking_plate(2).webp`} alt="Dangerous Socket Removal 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_blanking_plate(3).webp`} alt="Dangerous Socket Removal 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_blanking_plate(4).webp`} alt="Dangerous Socket Removal 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_blanking_plate(5).webp`} alt="Dangerous Socket Removal 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_blanking_plate(6).webp`} alt="Dangerous Socket Removal 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_blanking_plate(7).webp`} alt="Dangerous Socket Removal 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/electrical/e_blanking_plate(8).webp`} alt="Dangerous Socket Removal 8" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gallery-panel carpentry">
                            <div className="custom-select-container">
                                <div className="custom-select" data-select-type="job" data-default-value="carpentry-job-1">
                                    <button type="button" className="custom-select-trigger" aria-expanded="false" aria-label="Select project"></button>
                                    <ul className="custom-select-options" role="listbox">
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-1" role="option">Robot Vacuum Cleaner Ramp <span className="job-date">(Jan 2026)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-2" role="option">Upcycling Blanket Chest <span className="job-date">(Jul 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-3" role="option">Teak Furniture Restoration <span className="job-date">(Jul 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-4" role="option">Woodshed <span className="job-date">(Oct 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-5" role="option">Outdoor Coffee Table <span className="job-date">(Sep 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-6" role="option">Lego Table <span className="job-date">(Jul 2020)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-7" role="option">Birdbox <span className="job-date">(May 2020)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-8" role="option">Custom Desk <span className="job-date">(Apr 2020)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-9" role="option">Coffee Tables <span className="job-date">(Apr 2018)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-10" role="option">Alcove Shelves <span className="job-date">(Jul 2015)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-11" role="option">Bespoke Carving Board <span className="job-date">(Dec 2013)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="carpentry-job-12" role="option">Custom Built Chunky Stools <span className="job-date">(Nov 2013)</span></button></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="job-panels-container">
                                <div className="job-panel active" data-job="carpentry-job-1">
                                    <div className="gallery-text"><p>Built ramp out of leftover waste materials so a robot vacuum cleaner could get around an Edwardian house.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_robovac_ramp(1).webp`} alt="Robot Vacuum Cleaner Ramp 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_robovac_ramp(2).webp`} alt="Robot Vacuum Cleaner Ramp 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_robovac_ramp(3).webp`} alt="Robot Vacuum Cleaner Ramp 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_robovac_ramp(4).webp`} alt="Robot Vacuum Cleaner Ramp 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-2">
                                    <div className="gallery-text"><p>Lined and waterproofed an old blanket chest for outdoor storage.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_upcycling_chest(1).webp`} alt="Upcycling Blanket Chest 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_upcycling_chest(2).webp`} alt="Upcycling Blanket Chest 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_upcycling_chest(3).webp`} alt="Upcycling Blanket Chest 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_upcycling_chest(4).webp`} alt="Upcycling Blanket Chest 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_upcycling_chest(5).webp`} alt="Upcycling Blanket Chest 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_upcycling_chest(6).webp`} alt="Upcycling Blanket Chest 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_upcycling_chest(7).webp`} alt="Upcycling Blanket Chest 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_upcycling_chest(8).webp`} alt="Upcycling Blanket Chest 8" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-3">
                                    <div className="gallery-text"><p>Repaired and restored a vintage teak garden table and chairs.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_teak_furniture_restoral(1).webp`} alt="Teak Furniture Restoration 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_teak_furniture_restoral(2).webp`} alt="Teak Furniture Restoration 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_teak_furniture_restoral(3).webp`} alt="Teak Furniture Restoration 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_teak_furniture_restoral(4).webp`} alt="Teak Furniture Restoration 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-4">
                                    <div className="gallery-text"><p>Designed and constructed a waterproof woodshed out of upcycled materials.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_woodshed(1).webp`} alt="Woodshed 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_woodshed(2).webp`} alt="Woodshed 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_woodshed(3).webp`} alt="Woodshed 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_woodshed(4).webp`} alt="Woodshed 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_woodshed(5).webp`} alt="Woodshed 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_woodshed(6).webp`} alt="Woodshed 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_woodshed(7).webp`} alt="Woodshed 7" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-5">
                                    <div className="gallery-text"><p>Refurbished a garden table using decking planks to make a new surface.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_outdoor_table_rebuild(1).webp`} alt="Outdoor Coffee Table 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_outdoor_table_rebuild(2).webp`} alt="Outdoor Coffee Table 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_outdoor_table_rebuild(3).webp`} alt="Outdoor Coffee Table 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_outdoor_table_rebuild(4).webp`} alt="Outdoor Coffee Table 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-6">
                                    <div className="gallery-text"><p>Designed and built a LEGO table including a sliding drawer and building surface.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_lego_table(1).webp`} alt="Lego Table 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_lego_table(2).webp`} alt="Lego Table 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-7">
                                    <div className="gallery-text"><p>Upcycled wood offcuts to build a rustic birdbox.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_birdbox(1).webp`} alt="Birdbox 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_birdbox(2).webp`} alt="Birdbox 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-8">
                                    <div className="gallery-text"><p>Converted a disused chest of drawers into a stylish modern desk.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(1).webp`} alt="Custom Desk 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(2).webp`} alt="Custom Desk 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(3).webp`} alt="Custom Desk 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(4).webp`} alt="Custom Desk 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(5).webp`} alt="Custom Desk 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(6).webp`} alt="Custom Desk 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(7).webp`} alt="Custom Desk 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(8).webp`} alt="Custom Desk 8" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(9).webp`} alt="Custom Desk 9" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(10).webp`} alt="Custom Desk 10" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(11).webp`} alt="Custom Desk 11" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(12).webp`} alt="Custom Desk 12" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(13).webp`} alt="Custom Desk 13" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_desk(14).webp`} alt="Custom Desk 14" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-9">
                                    <div className="gallery-text"><p>Upcycled the leaves and legs from a dining table into two stylish coffee tables.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_stools(1).webp`} alt="Coffee Tables 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_stools(2).webp`} alt="Coffee Tables 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-10">
                                    <div className="gallery-text"><p>Rustic chunky alcove shelves built by carving and staining a modern piece of pine.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_rustic_shelves(1).webp`} alt="Alcove Shelves 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_rustic_shelves(2).webp`} alt="Alcove Shelves 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-11">
                                    <div className="gallery-text"><p>Designed and built a bespoke carving board to match an antique silver cloche.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_carving_board(1).webp`} alt="Bespoke Carving Board 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_carving_board(1.5).webp`} alt="Bespoke Carving Board 1.5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_carving_board(2).webp`} alt="Bespoke Carving Board 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_carving_board(3).webp`} alt="Bespoke Carving Board 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_carving_board(4).webp`} alt="Bespoke Carving Board 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="carpentry-job-12">
                                    <div className="gallery-text"><p>Designed and built two matching stools out of reclaimed joists.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/carpentry/cw_matching_stools.webp`} alt="Custom Built Chunky Stools 1" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="gallery-panel garden">
                            <div className="custom-select-container">
                                <div className="custom-select" data-select-type="job" data-default-value="garden-job-1">
                                    <button type="button" className="custom-select-trigger" aria-expanded="false" aria-label="Select project"></button>
                                    <ul className="custom-select-options" role="listbox">
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-1" role="option">Pergola Sunbathing Platform <span className="job-date">(Nov 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-2" role="option">Concrete Base & Bike Anchor <span className="job-date">(Oct 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-3" role="option">Decking Maintenance <span className="job-date">(Mar 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-4" role="option">Artificial Grass Patch Repair <span className="job-date">(Mar 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-5" role="option">Wooden Planter Fascia <span className="job-date">(Feb 2025)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-6" role="option">Large Rockery and Water feature <span className="job-date">(Oct 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-7" role="option">Weed Membrane and Slate Chippings <span className="job-date">(Oct 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-8" role="option">Herb Planters <span className="job-date">(Aug 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-9" role="option">Fence Repairs <span className="job-date">(Jul 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-10" role="option">General Garden Maintenance <span className="job-date">(Jul 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-11" role="option">Returfing a Section of Lawn <span className="job-date">(Jul 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-12" role="option">Repaired and Restored a Garden Storage Unit <span className="job-date">(May 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-13" role="option">Decking Patch Repairs <span className="job-date">(Apr 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-14" role="option">Garden Pond <span className="job-date">(Apr 2024)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-15" role="option">Decking Step <span className="job-date">(Sep 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-16" role="option">Decking Path <span className="job-date">(Jun 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-17" role="option">Bespoke Planters <span className="job-date">(Jun 2023)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-18" role="option">Brick Shed Roof <span className="job-date">(Oct 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-19" role="option">Bike Shed Reroof <span className="job-date">(Oct 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-20" role="option">Garden Office <span className="job-date">(May 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-21" role="option">Outdoor Furniture <span className="job-date">(Apr 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-22" role="option">Garden Trellis <span className="job-date">(Mar 2022)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-23" role="option">General Garden Clearance <span className="job-date">(Aug 2021)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-24" role="option">Dismantling of Brick Wall <span className="job-date">(Feb 2020)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-25" role="option">Fencepost Repairs <span className="job-date">(Feb 2016)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-26" role="option">Bike Shed and Trellis <span className="job-date">(Jun 2015)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-27" role="option">Grave Maintenance <span className="job-date">(Oct 2014)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-28" role="option">Garden Shed Upgrade <span className="job-date">(May 2012)</span></button></li>
                                        <li><button type="button" className="custom-select-option" data-value="garden-job-29" role="option">Full Garden Renovation <span className="job-date">(Dec 2009)</span></button></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="job-panels-container">
                                <div className="job-panel active" data-job="garden-job-1">
                                    <div className="gallery-text"><p>Designed and built an 8-foot-tall pergola and waterproofed platform with artificial grass.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(1).webp`} alt="Pergola Sunbathing Platform 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(2).webp`} alt="Pergola Sunbathing Platform 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(3).webp`} alt="Pergola Sunbathing Platform 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(4).webp`} alt="Pergola Sunbathing Platform 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(5).webp`} alt="Pergola Sunbathing Platform 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(6).webp`} alt="Pergola Sunbathing Platform 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(7).webp`} alt="Pergola Sunbathing Platform 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(8).webp`} alt="Pergola Sunbathing Platform 8" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(9).webp`} alt="Pergola Sunbathing Platform 9" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(10).webp`} alt="Pergola Sunbathing Platform 10" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(11).webp`} alt="Pergola Sunbathing Platform 11" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(12).webp`} alt="Pergola Sunbathing Platform 12" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(13).webp`} alt="Pergola Sunbathing Platform 13" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(14).webp`} alt="Pergola Sunbathing Platform 14" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(15).webp`} alt="Pergola Sunbathing Platform 15" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(16).webp`} alt="Pergola Sunbathing Platform 16" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pergola(17).webp`} alt="Pergola Sunbathing Platform 17" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-2">
                                    <div className="gallery-text"><p>Excavated earth, filled with concrete and installed a ground anchor for a bike shed.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_lock_anchor(0.5).webp`} alt="Concrete Base & Bike Anchor 0.5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_lock_anchor(1).webp`} alt="Concrete Base & Bike Anchor 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_lock_anchor(2).webp`} alt="Concrete Base & Bike Anchor 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_lock_anchor(3).webp`} alt="Concrete Base & Bike Anchor 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_lock_anchor(4).webp`} alt="Concrete Base & Bike Anchor 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_lock_anchor(5).webp`} alt="Concrete Base & Bike Anchor 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_lock_anchor(6).webp`} alt="Concrete Base & Bike Anchor 6" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-3">
                                    <div className="gallery-text"><p>Jet washed decking area and refreshed life with two coats of decking oil.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_decking_oil(1).webp`} alt="Decking Maintenance 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_decking_oil(2).webp`} alt="Decking Maintenance 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_decking_oil(3).webp`} alt="Decking Maintenance 3" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-4">
                                    <div className="gallery-text"><p>Replaced a patch of real grass that wouldn't grow with high-quality artificial turf.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_artifical_turf(1).webp`} alt="Artificial Grass Patch Repair 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_artifical_turf(2).webp`} alt="Artificial Grass Patch Repair 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-5">
                                    <div className="gallery-text"><p>Constructed a bespoke wooden planter fascia to cover an ugly plastic planter.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_planter_fascia(1).webp`} alt="Wooden Planter Fascia 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_planter_fascia(2).webp`} alt="Wooden Planter Fascia 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_planter_fascia(3).webp`} alt="Wooden Planter Fascia 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_planter_fascia(4).webp`} alt="Wooden Planter Fascia 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-6">
                                    <div className="gallery-text"><p>Built a rockery and installed a waterfall, including all of the pipework.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_rockery_waterfall(1).webp`} alt="Large Rockery and Water feature 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_rockery_waterfall(2).webp`} alt="Large Rockery and Water feature 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_rockery_waterfall(3).webp`} alt="Large Rockery and Water feature 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_rockery_waterfall(4).webp`} alt="Large Rockery and Water feature 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_rockery_waterfall(5).webp`} alt="Large Rockery and Water feature 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_rockery_waterfall(6).webp`} alt="Large Rockery and Water feature 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_rockery_waterfall(7).webp`} alt="Large Rockery and Water feature 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_rockery_waterfall(8).webp`} alt="Large Rockery and Water feature 8" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_rockery_waterfall(9).webp`} alt="Large Rockery and Water feature 9" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_rockery_waterfall(10).webp`} alt="Large Rockery and Water feature 10" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_rockery_waterfall(11).webp`} alt="Large Rockery and Water feature 11" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_rockery_waterfall(12).webp`} alt="Large Rockery and Water feature 12" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-7">
                                    <div className="gallery-text"><p>Cleared area, laid weed-proof membrane and finished with slate chippings.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_slate_chippings(1).webp`} alt="Weed Membrane and Slate Chippings 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_slate_chippings(2).webp`} alt="Weed Membrane and Slate Chippings 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_slate_chippings(3).webp`} alt="Weed Membrane and Slate Chippings 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_slate_chippings(4).webp`} alt="Weed Membrane and Slate Chippings 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-8">
                                    <div className="gallery-text"><p>Designed and built custom herb planters with blackboard labels.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_herb_planters(1).webp`} alt="Herb Planters 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_herb_planters(2).webp`} alt="Herb Planters 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_herb_planters(3).webp`} alt="Herb Planters 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_herb_planters(4).webp`} alt="Herb Planters 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_herb_planters(5).webp`} alt="Herb Planters 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_herb_planters(6).webp`} alt="Herb Planters 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_herb_planters(7).webp`} alt="Herb Planters 7" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-9">
                                    <div className="gallery-text"><p>Removed rotten posts and installed new ones including waterproof membrane.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_fencing(1).webp`} alt="Fence Repairs 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_fencing(2).webp`} alt="Fence Repairs 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_fencing(3).webp`} alt="Fence Repairs 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_fencing(4).webp`} alt="Fence Repairs 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-10">
                                    <div className="gallery-text"><p>Pruning and training creepers as well as refreshing glass of a lean to conservatory.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_outhouse_vines(1).webp`} alt="General Garden Maintenance 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_outhouse_vines(2).webp`} alt="General Garden Maintenance 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_outhouse_vines(3).webp`} alt="General Garden Maintenance 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_outhouse_vines(4).webp`} alt="General Garden Maintenance 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-11">
                                    <div className="gallery-text"><p>Removal of old weed-strewn turf and neat installation of new turf.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_turf(1).webp`} alt="Returfing a Section of Lawn 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_turf(2).webp`} alt="Returfing a Section of Lawn 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_turf(3).webp`} alt="Returfing a Section of Lawn 3" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-12">
                                    <div className="gallery-text"><p>Deconstructed a tired storage unit, repaired boards, and reconstructed.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_storage_shed(1).webp`} alt="Repaired and Restored a Garden Storage Unit 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_storage_shed(2).webp`} alt="Repaired and Restored a Garden Storage Unit 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_storage_shed(3).webp`} alt="Repaired and Restored a Garden Storage Unit 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_storage_shed(4).webp`} alt="Repaired and Restored a Garden Storage Unit 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_storage_shed(5).webp`} alt="Repaired and Restored a Garden Storage Unit 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_storage_shed(6).webp`} alt="Repaired and Restored a Garden Storage Unit 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_storage_shed(7).webp`} alt="Repaired and Restored a Garden Storage Unit 7" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-13">
                                    <div className="gallery-text"><p>Lifted old decking, replaced rotten joists and planks where needed.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_decking_patch_repairs(1).webp`} alt="Decking Patch Repairs 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_decking_patch_repairs(2).webp`} alt="Decking Patch Repairs 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_decking_patch_repairs(3).webp`} alt="Decking Patch Repairs 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_decking_patch_repairs(4).webp`} alt="Decking Patch Repairs 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-14">
                                    <div className="gallery-text"><p>Cleared vegetation, dug area, and installed a pond with fountain and slate surround.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pond(1).webp`} alt="Garden Pond 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pond(2).webp`} alt="Garden Pond 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pond(3).webp`} alt="Garden Pond 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pond(4).webp`} alt="Garden Pond 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pond(5).webp`} alt="Garden Pond 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pond(6).webp`} alt="Garden Pond 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pond(7).webp`} alt="Garden Pond 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pond(8).webp`} alt="Garden Pond 8" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pond(9).webp`} alt="Garden Pond 9" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pond(10).webp`} alt="Garden Pond 10" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_pond(11).webp`} alt="Garden Pond 11" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-15">
                                    <div className="gallery-text"><p>Installed a large step made of decking to reduce the height change.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_decking_step(1).webp`} alt="Decking Step 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_decking_step(2).webp`} alt="Decking Step 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_decking_step(3).webp`} alt="Decking Step 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_decking_step(4).webp`} alt="Decking Step 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_decking_step(5).webp`} alt="Decking Step 5" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-16">
                                    <div className="gallery-text"><p>Removed old broken path. Installed joists, weed membrane and new decking path.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_decking_path(1).webp`} alt="Decking Path 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_decking_path(2).webp`} alt="Decking Path 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_decking_path(3).webp`} alt="Decking Path 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_decking_path(4).webp`} alt="Decking Path 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_decking_path(5).webp`} alt="Decking Path 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_decking_path(6).webp`} alt="Decking Path 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_decking_path(7).webp`} alt="Decking Path 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_decking_path(8).webp`} alt="Decking Path 8" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_decking_path(9).webp`} alt="Decking Path 9" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_decking_path(10).webp`} alt="Decking Path 10" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-17">
                                    <div className="gallery-text"><p>Built custom planters from upcycled decking materials.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_planters(1).webp`} alt="Bespoke Planters 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_planters(2).webp`} alt="Bespoke Planters 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_planters(3).webp`} alt="Bespoke Planters 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_planters(4).webp`} alt="Bespoke Planters 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_planters(5).webp`} alt="Bespoke Planters 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_planters(6).webp`} alt="Bespoke Planters 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_planters(7).webp`} alt="Bespoke Planters 7" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_planters(8).webp`} alt="Bespoke Planters 8" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/cw_planters(9).webp`} alt="Bespoke Planters 9" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-18">
                                    <div className="gallery-text"><p>Resealed lead flashing and laid fresh felt to waterproof a shed roof.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brick_shed_roof(1).webp`} alt="Brick Shed Roof 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brick_shed_roof(2).webp`} alt="Brick Shed Roof 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brick_shed_roof(3).webp`} alt="Brick Shed Roof 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brick_shed_roof(4).webp`} alt="Brick Shed Roof 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brick_shed_roof(5).webp`} alt="Brick Shed Roof 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brick_shed_roof(6).webp`} alt="Brick Shed Roof 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brick_shed_roof(7).webp`} alt="Brick Shed Roof 7" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-19">
                                    <div className="gallery-text"><p>Installed a new Onduline roof on a bike shed and painted to preserve.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_shed_reroof(1).webp`} alt="Bike Shed Reroof 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_shed_reroof(2).webp`} alt="Bike Shed Reroof 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_shed_reroof(3).webp`} alt="Bike Shed Reroof 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_shed_reroof(4).webp`} alt="Bike Shed Reroof 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_shed_reroof(5).webp`} alt="Bike Shed Reroof 5" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-20">
                                    <div className="gallery-text"><p>Co-constructed a foundation and built a garden office from a kit.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_office(1).webp`} alt="Garden Office 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_office(2).webp`} alt="Garden Office 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_office(3).webp`} alt="Garden Office 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_office(4).webp`} alt="Garden Office 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_office(5).webp`} alt="Garden Office 5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_office(6).webp`} alt="Garden Office 6" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_garden_office(7).webp`} alt="Garden Office 7" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-21">
                                    <div className="gallery-text"><p>Conversion from a box of bits to a comfortable outdoor sofa.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_outdoor_furnture(1).webp`} alt="Outdoor Furniture 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_outdoor_furnture(2).webp`} alt="Outdoor Furniture 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-22">
                                    <div className="gallery-text"><p>Removed old fence panels and installed full 6ft trellis panels.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_trellis(1).webp`} alt="Garden Trellis 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_trellis(2).webp`} alt="Garden Trellis 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_trellis(3).webp`} alt="Garden Trellis 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_trellis(4).webp`} alt="Garden Trellis 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_trellis(5).webp`} alt="Garden Trellis 5" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-23">
                                    <div className="gallery-text"><p>Cleared a mountain of climbers and pruned plants to tidy up.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_general_garden_clearance(1).webp`} alt="General Garden Clearance 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_general_garden_clearance(2).webp`} alt="General Garden Clearance 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_general_garden_clearance(3).webp`} alt="General Garden Clearance 3" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-24">
                                    <div className="gallery-text"><p>Safely removed a wall that was falling down and re-rendered the house wall.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brickwall_removal(0.5).webp`} alt="Dismantling of Brick Wall 0.5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brickwall_removal(1).webp`} alt="Dismantling of Brick Wall 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brickwall_removal(2).webp`} alt="Dismantling of Brick Wall 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brickwall_removal(3).webp`} alt="Dismantling of Brick Wall 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brickwall_removal(4).webp`} alt="Dismantling of Brick Wall 4" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_brickwall_removal(5).webp`} alt="Dismantling of Brick Wall 5" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-25">
                                    <div className="gallery-text"><p>Dug rusted supports out of concrete and installed new supports and posts.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_fencepost_repairs(1).webp`} alt="Fencepost Repairs 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_fencepost_repairs(2).webp`} alt="Fencepost Repairs 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_fencepost_repairs(3).webp`} alt="Fencepost Repairs 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_fencepost_repairs(4).webp`} alt="Fencepost Repairs 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-26">
                                    <div className="gallery-text"><p>Added foundation joists. Constructed a bike shed. Built and installed customised trellis.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_shed_trellis(0.5).webp`} alt="Bike Shed and Trellis 0.5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_shed_trellis(1).webp`} alt="Bike Shed and Trellis 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_shed_trellis(2).webp`} alt="Bike Shed and Trellis 2" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_shed_trellis(3).webp`} alt="Bike Shed and Trellis 3" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_bike_shed_trellis(4).webp`} alt="Bike Shed and Trellis 4" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-27">
                                    <div className="gallery-text"><p>Specialised grave maintenance and restoration work.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_grave_maintenance.webp`} alt="Grave Maintenance 1" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-28">
                                    <div className="gallery-text"><p>Painted a standard garden shed into a beach hut style shed.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_shed_paint(1).webp`} alt="Garden Shed Upgrade 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_shed_paint(2).webp`} alt="Garden Shed Upgrade 2" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="job-panel" data-job="garden-job-29">
                                    <div className="gallery-text"><p>Sadly only part transformation photos available for this complete renovation.</p></div>
                                    <div className="gallery-carousel">
                                        <div className="carousel-track">
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_full_garden_job(1).webp`} alt="Full Garden Renovation 1" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_full_garden_job(1.5).webp`} alt="Full Garden Renovation 1.5" /></div>
                                            <div className="carousel-slide"><img src={`${basePath}images/garden/gmp_full_garden_job(2).webp`} alt="Full Garden Renovation 2" /></div>
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
                                <li><button type="button" className="custom-select-option" data-value="general" role="option" aria-selected="false">General Repairs &amp; Small Jobs</button></li>
                                <li><button type="button" className="custom-select-option" data-value="plumbing" role="option" aria-selected="false">Minor Plumbing</button></li>
                                <li><button type="button" className="custom-select-option" data-value="electrical" role="option" aria-selected="false">Minor Electrical</button></li>
                                <li><button type="button" className="custom-select-option" data-value="carpentry" role="option" aria-selected="false">Carpentry &amp; Woodwork</button></li>
                                <li><button type="button" className="custom-select-option" data-value="garden" role="option" aria-selected="false">Outdoor &amp; Garden Work</button></li>
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

                        <div className="testimonial" data-category="garden">
                            <p>"Re-levelled our lawn and added drainage so it finally survives winter."</p>
                            <p><strong>Martin P.</strong> <span className="testimonial-date">(August 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="garden">
                            <p>"Built a cedar planter bench that’s both sturdy and beautiful."</p>
                            <p><strong>Ana &amp; Chris</strong> <span className="testimonial-date">(April 2024)</span></p>
                        </div>
                        <div className="testimonial" data-category="garden">
                            <p>"Top-notch garden refresh—our patio and planters look amazing."</p>
                            <p><strong>David Kim</strong> <span className="testimonial-date">(February 2024)</span></p>
                        </div>
                    </div>
                </section>

                <section id="about">
                    <h2>About Me</h2>
                    <div className="about-header">
                        <img src={`${basePath}images/OneManAndAToolBox.webp`} alt="Friendly Handyman" />
                        <p className="about-intro">Hello. My name is Adam and I'm your local, reliable handyman dedicated to providing high-quality work.</p>
                    </div>
                    <p>I guarantee a friendly and professional attitude, and that I will actually return your calls! As you can see from the gallery, I have a lot of experience across a range of trades, and no job is too small. I will shorten your to-do list and lower domestic stress levels! I pride myself on completing work to a high standard and ensuring you're happy with the result.</p>
                    <p><strong>Don't DIY, call One Man and a Toolbox.</strong></p>
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
                    <p>Have a job that needs doing?<br />Please contact me to see if I can help.</p>
                    <p><strong><img src={`${basePath}whatsapp.webp`} alt="WhatsApp" className="contact-icon" /> WhatsApp:</strong> <a href="https://wa.me/447902251152" target="_blank" rel="noopener noreferrer" className="contact-link">Message me</a></p>
                    <p><strong>✉️ Email:</strong> <a href="mailto:onemanandatoolboxuk@gmail.com" className="contact-link">onemanandatoolboxuk@gmail.com</a></p>
                    <p><strong>📞 Call:</strong> <a href="tel:07902251152" className="contact-link">07902 251152</a></p>
                    <div style={{ textAlign: 'center', padding: '10px', background: '#2c3e50', color: '#fff', borderRadius: '12px' }}>
                        <p style={{ margin: 0 }}>&copy; 2026 One Man and a Toolbox</p>
                    </div>
                </section>
            </div>

            {/* Lightbox Modal */}
            <div id="lightbox" className="lightbox" aria-hidden="true" role="dialog">
                <div className="lightbox-content">
                    {/* Track will be injected here */}
                </div>
                <button type="button" className="lightbox-arrow arrow-prev" aria-label="Previous image">‹</button>
                <button type="button" className="lightbox-arrow arrow-next" aria-label="Next image">›</button>
                <div className="lightbox-counter"></div>
            </div>
        </>
    );
}
