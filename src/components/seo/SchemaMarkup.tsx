import Script from 'next/script'

interface SchemaMarkupProps {
  type: 'LocalBusiness' | 'Course' | 'FAQ' | 'Organization'
  data?: any
}

export function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  const getSchemaData = () => {
    const baseUrl = 'https://glitzfusion.in'
    
    switch (type) {
      case 'LocalBusiness':
        return {
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          "@id": `${baseUrl}/#organization`,
          "name": "GLITZFUSION Academy",
          "alternateName": "GLITZFUSION",
          "description": "Badlapur's first media academy offering professional Acting, Dancing, Photography, Filmmaking & Modeling courses with expert instructors and 95% success rate.",
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo/Glitzfusion%20logo%20bg%20rm.png`,
            "width": 512,
            "height": 512
          },
          "image": [
            `${baseUrl}/og-image.jpg`,
            `${baseUrl}/og-home.jpg`,
            `${baseUrl}/og-courses.jpg`
          ],
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "GLITZFUSION Academy",
            "addressLocality": "Badlapur",
            "addressRegion": "Maharashtra",
            "postalCode": "421503",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 19.1559,
            "longitude": 73.2673
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-98765-43210",
            "contactType": "customer service",
            "email": "contact@glitzfusion.in",
            "availableLanguage": ["English", "Hindi", "Marathi"]
          },
          "sameAs": [
            "https://instagram.com/glitzfusion",
            "https://facebook.com/glitzfusion",
            "https://youtube.com/@glitzfusion",
            "https://twitter.com/glitzfusion"
          ],
          "foundingDate": "2023",
          "founder": {
            "@type": "Person",
            "name": "GLITZFUSION Founders"
          },
          "numberOfEmployees": "15-25",
          "slogan": "Transform Your Creative Passion",
          "knowsAbout": [
            "Acting Training",
            "Dance Education",
            "Photography Courses",
            "Filmmaking",
            "Modeling Training",
            "Media Arts Education",
            "Creative Arts",
            "Performance Arts"
          ],
          "areaServed": [
            {
              "@type": "City",
              "name": "Badlapur"
            },
            {
              "@type": "City", 
              "name": "Kalyan"
            },
            {
              "@type": "City",
              "name": "Dombivli"
            },
            {
              "@type": "State",
              "name": "Maharashtra"
            }
          ],
          "priceRange": "₹₹",
          "currenciesAccepted": "INR",
          "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer", "UPI"],
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "18:00"
            },
            {
              "@type": "OpeningHoursSpecification", 
              "dayOfWeek": ["Saturday"],
              "opens": "09:00",
              "closes": "17:00"
            }
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Media Arts Courses",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Course",
                  "name": "Professional Acting Course",
                  "description": "6-month comprehensive acting program covering method acting, screen techniques, and character development",
                  "provider": {
                    "@type": "EducationalOrganization",
                    "name": "GLITZFUSION Academy"
                  }
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Course", 
                  "name": "Dance Training Program",
                  "description": "4-month intensive dance course covering classical, contemporary, and commercial choreography",
                  "provider": {
                    "@type": "EducationalOrganization",
                    "name": "GLITZFUSION Academy"
                  }
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Course",
                  "name": "Photography Mastery Course", 
                  "description": "3-month professional photography course covering studio lighting, editing, and portfolio development",
                  "provider": {
                    "@type": "EducationalOrganization",
                    "name": "GLITZFUSION Academy"
                  }
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Course",
                  "name": "Filmmaking Program",
                  "description": "8-month comprehensive filmmaking course covering directing, cinematography, and post-production",
                  "provider": {
                    "@type": "EducationalOrganization", 
                    "name": "GLITZFUSION Academy"
                  }
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Course",
                  "name": "Modeling Training Course",
                  "description": "2-month modeling program covering runway techniques, posing, and industry networking",
                  "provider": {
                    "@type": "EducationalOrganization",
                    "name": "GLITZFUSION Academy"
                  }
                }
              }
            ]
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "Priya Sharma"
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5"
              },
              "reviewBody": "Excellent acting classes in Badlapur! The instructors are industry professionals and the training is world-class."
            },
            {
              "@type": "Review", 
              "author": {
                "@type": "Person",
                "name": "Rahul Patel"
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5"
              },
              "reviewBody": "Best dance academy in the region. My daughter has improved tremendously in just 3 months."
            }
          ]
        }

      case 'Course':
        return {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": data?.title || "Media Arts Course",
          "description": data?.description || "Professional media arts training course",
          "provider": {
            "@type": "EducationalOrganization",
            "name": "GLITZFUSION Academy",
            "url": baseUrl
          },
          "courseCode": data?.slug?.toUpperCase(),
          "educationalLevel": data?.level || "Beginner to Advanced",
          "timeRequired": data?.duration || "Variable",
          "coursePrerequisites": "No prior experience required",
          "teaches": data?.highlights || [],
          "courseMode": data?.format?.includes('Online') ? "online" : "in-person",
          "locationCreated": {
            "@type": "Place",
            "name": "Badlapur, Maharashtra, India"
          },
          "inLanguage": "en-IN",
          "availableLanguage": ["English", "Hindi", "Marathi"],
          "offers": {
            "@type": "Offer",
            "price": data?.investment?.replace(/[₹,]/g, '') || "0",
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
            "validFrom": "2024-01-01",
            "category": "Education"
          },
          "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "blended",
            "startDate": data?.nextStart || "2025-01-01",
            "endDate": "2025-12-31",
            "instructor": {
              "@type": "Person",
              "name": "GLITZFUSION Faculty",
              "description": "Industry professional instructors"
            }
          }
        }

      case 'FAQ':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What courses does GLITZFUSION Academy offer in Badlapur?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "GLITZFUSION Academy offers professional courses in Acting (6 months), Dancing (4 months), Photography (3 months), Filmmaking (8 months), and Modeling (2 months). All courses are taught by industry experts with hands-on training and career placement support."
              }
            },
            {
              "@type": "Question",
              "name": "Where is GLITZFUSION Academy located in Badlapur?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "GLITZFUSION Academy is located in Badlapur, Maharashtra. We are Badlapur's first media academy, easily accessible from Kalyan, Dombivli, and surrounding areas in the Mumbai region."
              }
            },
            {
              "@type": "Question",
              "name": "What are the admission requirements for GLITZFUSION courses?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No prior experience is required for most courses. We welcome students of all skill levels from beginners to advanced. Age requirements vary by course, and we offer flexible scheduling options including weekend and evening batches."
              }
            },
            {
              "@type": "Question",
              "name": "Do you provide placement assistance after course completion?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, GLITZFUSION Academy provides comprehensive career placement support including portfolio development, industry networking, audition preparation, and direct connections with our 50+ industry partners. We maintain a 95% success rate for student placements."
              }
            },
            {
              "@type": "Question",
              "name": "What makes GLITZFUSION different from other media academies?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "GLITZFUSION is Badlapur's first media academy with industry-expert instructors, state-of-the-art facilities, small batch sizes for personalized attention, practical hands-on training, and strong industry connections. We focus on both skill development and career placement."
              }
            }
          ]
        }

      case 'Organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`,
          "name": "GLITZFUSION Academy",
          "url": baseUrl,
          "logo": `${baseUrl}/logo/Glitzfusion%20logo%20bg%20rm.png`,
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-98765-43210",
            "contactType": "customer service",
            "email": "contact@glitzfusion.in"
          },
          "sameAs": [
            "https://instagram.com/glitzfusion",
            "https://facebook.com/glitzfusion", 
            "https://youtube.com/@glitzfusion"
          ]
        }

      default:
        return {}
    }
  }

  return (
    <Script
      id={`schema-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getSchemaData())
      }}
    />
  )
}
