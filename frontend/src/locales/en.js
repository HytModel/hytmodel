export default {
    // Common
    common: {
        loading: 'Loading...',
        cancel: 'Cancel',
        close: 'Close',
        back: 'Back',
        add: 'Add',
        edit: 'Edit',
        delete: 'Delete',
        update: 'Update',
        all: 'All',
        none: 'None',
        error: 'Error',
        by: 'by',
        optional: 'optional'
    },

    // Home Page
    home: {
        hero: {
            badge: 'The reference gaming marketplace',
            title: 'Find the perfect',
            titleHighlight: 'product for your project',
            description: 'Thousands of premium resources created by talented artists. 3D models, textures, plugins, maps and more.',
            exploreButton: 'Explore products',
            creatorButton: 'Become a creator'
        },
        stats: {
            products: 'Products',
            creators: 'Creators',
            sales: 'Sales',
            rating: 'Average rating'
        },
        games: {
            title: 'Our game universes',
            subtitle: 'Explore products by game',
            viewAll: 'View all products',
            explore: 'Explore products'
        },
        popular: {
            title: 'Popular products',
            subtitle: 'Discover the most appreciated creations',
            viewAll: 'View all',
            empty: 'No products available at the moment'
        },
        whyUs: {
            title: 'Why choose HytModel?',
            subtitle: 'A platform designed for creators and buyers'
        },
        features: {
            quality: {
                title: 'Verified quality',
                description: 'Every product is reviewed by our team before publication.'
            },
            instant: {
                title: 'Instant download',
                description: 'Access your purchases immediately after payment.'
            },
            community: {
                title: 'Active community',
                description: 'Join thousands of creators and buyers.'
            },
            revenue: {
                title: 'Fair revenue',
                description: 'Creators keep up to 90% of sales.'
            }
        },
        cta: {
            title: 'Ready to start?',
            description: 'Join our community of creators and buyers today.',
            registerButton: 'Create a free account',
            exploreButton: 'Explore without account'
        }
    },

    // Invoices
    invoices: {
        title: 'My Invoices',
        subtitle: 'View and download your invoices',
        invoiceNumber: 'Invoice',
        downloadPdf: 'Download PDF',
        stats: {
            purchaseInvoices: 'Purchase invoices',
            paymentNotes: 'Payment notes'
        },
        tabs: {
            purchases: 'My purchases',
            sales: 'My sales'
        },
        empty: {
            title: 'No invoices',
            noPurchases: 'You have no purchase invoices yet',
            noSales: 'You have no payment notes yet'
        },
        success: {
            downloaded: 'Invoice downloaded'
        },
        errors: {
            loadFailed: 'Error loading invoices',
            downloadFailed: 'Error downloading'
        }
    },

    // Login
    login: {
        title: 'Login',
        subtitle: 'Sign in to your account',
        email: 'Email',
        emailPlaceholder: 'you@example.com',
        password: 'Password',
        submit: 'Sign in',
        noAccount: "Don't have an account?",
        createAccount: 'Create an account',
        orContinueWith: 'Or continue with',
        twoFA: {
            title: '2FA Verification',
            subtitle: 'Enter the code from your authentication app',
            codeLabel: 'Authentication code',
            codeHint: 'Enter the 6-digit code from your app (Google Authenticator, Authy, etc.)',
            verify: 'Verify',
            backupCodeHint: 'You can also use a backup code'
        },
        errors: {
            fillAllFields: 'Please fill in all fields',
            enter2FACode: 'Please enter your authentication code',
            loginFailed: 'Login error'
        }
    },

    // Model Detail
    modelDetail: {
        backToProducts: 'Back to products',
        description: 'Description',
        tags: 'Tags',
        compatibleVersions: 'Compatible game versions',
        price: 'Price',
        addToCart: 'Add to cart',
        inCart: 'In cart',
        editProduct: 'Edit my product',
        report: 'Report',
        creator: 'Creator',
        youtube: {
            title: 'Presentation video'
        },
        stats: {
            reviews: 'reviews',
            views: 'Views',
            downloads: 'Downloads'
        },
        dependencies: {
            title: 'Dependencies',
            requiredFor: 'Required for operation',
            recommended: 'Recommended',
            siteProduct: 'Site product',
            inCart: 'In cart',
            version: 'Version',
            officialSite: 'Official site',
            view: 'View'
        },
        download: {
            button: 'Download',
            availableVersions: 'Available versions',
            latest: 'Latest',
            filterByGameVersion: 'Filter by game version',
            allVersions: 'All versions',
            compatibleWith: 'Compatible with',
            success: 'Download started',
            errors: {
                selectVersion: 'Select a version',
                failed: 'Download error'
            }
        },
        share: {
            button: 'Share',
            success: 'Link copied!'
        },
        rating: {
            title: 'Rate this product',
            success: 'Rating saved',
            error: 'Error while rating'
        },
        errors: {
            notFound: 'Product not found'
        }
    },

    // Models / Shop
    models: {
        title: 'Shop',
        subtitle: 'Discover our products and bundles',
        searchPlaceholder: 'Search...',
        tabs: {
            products: 'Products',
            bundles: 'Bundles'
        },
        filters: {
            button: 'Filters',
            title: 'Advanced filters',
            clearAll: 'Clear all',
            activeFilters: 'Active filters',
            game: 'Game',
            allGames: 'All games',
            category: 'Category',
            allCategories: 'All categories',
            minPrice: 'Min price (€)',
            maxPrice: 'Max price (€)',
            gameVersions: 'Game versions',
            tags: 'Tags',
            available: '{{count}} available',
            versionsSelected: '{{count}} version(s) selected',
            tagsSelected: '{{count}} tag(s) selected',
            selectGameForVersions: 'Select a game to filter by version',
            sortBy: 'Sort by',
            sort: {
                newest: 'Newest',
                popular: 'Most popular',
                rating: 'Best rated',
                priceAsc: 'Price: low to high',
                priceDesc: 'Price: high to low'
            }
        },
        results: '{{count}} result(s) found',
        bundles: {
            productCount: '{{count}} products',
            empty: {
                title: 'No bundles available',
                description: 'Sellers have not created any bundles yet'
            }
        },
        empty: {
            title: 'No products found',
            description: 'Try modifying your search criteria',
            clearFilters: 'Clear filters'
        }
    },

    // My Products (Dashboard)
    myProducts: {
        title: 'My products',
        backToDashboard: 'Back to dashboard',
        count: '{{count}} product(s)',
        addProduct: 'Add a product',
        sales: '{{count}} sales',
        confirmDelete: 'Are you sure you want to delete "{{title}}"?',
        stats: {
            total: 'Total',
            online: 'Online',
            pending: 'Pending',
            hidden: 'Hidden'
        },
        status: {
            online: 'Online',
            pending: 'Pending',
            rejected: 'Rejected',
            hidden: 'Hidden'
        },
        empty: {
            title: 'No products',
            description: 'You have not added any products yet.',
            addFirst: 'Add my first product'
        },
        messages: {
            hiddenByTeam: 'Product hidden by the team',
            reason: 'Reason',
            rejected: 'Product rejected',
            rejectedDescription: 'This product was not approved by the moderation team.',
            pendingValidation: 'Pending validation by the team.'
        },
        actions: {
            view: 'View',
            edit: 'Edit',
            delete: 'Delete'
        },
        reports: {
            count: '{{count}} report(s)',
            active: '{{count}} active',
            noDescription: 'No description',
            staffNote: 'Staff note',
            yourResponse: 'Your response',
            sentOn: 'Sent on',
            respond: 'Respond',
            reasons: {
                bug: 'Technical bug',
                error: 'Missing files',
                misleading: 'Misleading description',
                copyright: 'Copyright violation',
                inappropriate: 'Inappropriate content',
                other: 'Other'
            },
            status: {
                pending: 'Pending verification',
                reviewed: 'Under review',
                resolved: 'Resolved',
                dismissed: 'Dismissed (unfounded)'
            },
            modal: {
                title: 'Respond to report',
                responseLabel: 'Your response / argumentation',
                responsePlaceholder: 'Explain why this report is unfounded, or the actions you have taken to fix the problem...',
                responseHint: 'This response will be visible to the moderation team.',
                send: 'Send',
                success: 'Response sent',
                errors: {
                    emptyResponse: 'Please enter a response',
                    sendFailed: 'Error sending'
                }
            }
        },
        success: {
            deleted: 'Product deleted'
        },
        errors: {
            loadFailed: 'Error loading products',
            deleteFailed: 'Error deleting'
        }
    },

    // My Purchases
    myPurchases: {
        title: 'My purchases',
        count: '{{count}} product(s) purchased',
        download: 'Download',
        viewProduct: 'View product',
        empty: {
            title: 'No purchases',
            description: 'You have not made any purchases yet',
            discoverProducts: 'Discover products'
        },
        invoices: {
            title: 'Invoices',
            description: 'Your invoices are sent by email after each purchase. Contact support if you need a copy.'
        },
        success: {
            downloadStarted: 'Download started'
        },
        errors: {
            loadFailed: 'Error loading purchases',
            downloadFailed: 'Error downloading'
        }
    },

    // New Custom Request
    newCustomRequest: {
        title: 'New custom request',
        subtitle: 'Describe your project to receive offers from our creators',
        success: 'Request sent! It will be reviewed by our team.',
        info: {
            title: 'Good to know',
            point1: 'Your request will be reviewed by our team before publication',
            point2: 'Affiliated creators will then be able to send you offers',
            point3: 'Payment in 2 installments: 50% upon acceptance, 50% upon delivery',
            point4: 'In case of cancellation, only 50% of the deposit is refunded'
        },
        form: {
            titleLabel: 'Title of your request',
            titlePlaceholder: 'Ex: Modern FiveM menu interface',
            descriptionLabel: 'Detailed description',
            descriptionPlaceholder: 'Describe in detail what you want: features, visual style, references, etc.',
            minCharacters: 'minimum characters',
            budgetSection: 'Budget and deadline',
            budgetMin: 'Minimum budget (€)',
            budgetMax: 'Maximum budget (€)',
            deadline: 'Desired deadline',
            categorySection: 'Category',
            game: 'Related game',
            selectGame: 'Select a game',
            productType: 'Product type',
            selectCategory: 'Select a category',
            attachments: 'Attachments',
            attachmentsHint: 'Add reference images, mockups, or any useful document (max 5 files, 50MB each)',
            uploadHint: 'Click or drag files here',
            submit: 'Submit my request'
        },
        errors: {
            fileTooLarge: '{{name}} is too large (max 50MB)',
            maxFiles: 'Maximum 5 files allowed',
            titleDescriptionRequired: 'Title and description required',
            descriptionMinLength: 'Description must be at least 50 characters',
            createFailed: 'Error creating request'
        }
    },

    // Not Found (404)
    notFound: {
        title: 'Page not found',
        description: 'Oops! The page you are looking for seems to have disappeared into another dimension.',
        backHome: 'Back to home',
        exploreModels: 'Explore models',
        goBack: 'Go back'
    },

    // OAuth Callback
    oauthCallback: {
        loading: 'Signing in...',
        success: 'Successfully signed in!',
        error: 'Error signing in'
    },

    // Product Versions Manager
    productVersions: {
        title: 'File versions',
        newVersion: 'New version',
        main: 'Main',
        downloads: 'downloads',
        releaseNotes: 'Release notes',
        compatibleVersions: 'Compatible game versions',
        setAsMain: 'Set as main',
        confirmDelete: 'Delete this version? This action is irreversible.',
        empty: {
            title: 'No versions',
            description: 'Add the first version of your file',
            addFirst: 'Add a version'
        },
        modal: {
            createTitle: 'New version',
            editTitle: 'Edit version',
            versionNumber: 'Version number',
            versionPlaceholder: 'Ex: 1.0.0, 2.1.3, v3.0...',
            file: 'File',
            clickToSelect: 'Click to select a file',
            fileFormats: 'ZIP, RAR, 7Z, TAR, GZ (max 500MB)',
            compatibleVersions: 'Compatible game versions',
            noGameVersions: 'No game versions available',
            versionsSelected: '{{count}} version(s) selected',
            changelog: 'Release notes (changelog)',
            changelogPlaceholder: 'Describe the changes in this version...',
            mainVersion: 'Main version',
            mainVersionHint: 'This version will be downloaded by default',
            errors: {
                versionRequired: 'Version number required',
                fileRequired: 'File required'
            }
        },
        success: {
            added: 'Version added',
            updated: 'Version updated',
            deleted: 'Version deleted',
            setMain: 'Version set as main'
        }
    },

    // Profile
    profile: {
        title: 'My Profile',
        save: 'Save',
        tabs: {
            profile: 'Profile',
            security: 'Security',
            connections: 'Connections'
        },
        avatar: {
            title: 'Profile picture',
            hint: 'JPG, PNG or GIF. Max 2 MB.'
        },
        info: {
            title: 'Information',
            displayName: 'Display name',
            bio: 'Bio',
            bioPlaceholder: 'Tell us about yourself...',
            website: 'Website'
        },
        social: {
            title: 'Social networks',
            discordPlaceholder: 'username#0000 or server ID',
            youtubePlaceholder: 'Your channel URL'
        },
        password: {
            title: 'Password',
            subtitle: 'Change your password',
            current: 'Current password',
            new: 'New password',
            confirm: 'Confirm',
            change: 'Change password'
        },
        twoFA: {
            title: 'Two-factor authentication (2FA)',
            enabled: 'Your account is protected by 2FA',
            disabled: 'Add an extra layer of security',
            active: 'Active',
            enable: 'Enable',
            disable: 'Disable',
            confirmDisable: 'Are you sure you want to disable two-factor authentication?',
            setup: {
                title: '2FA Setup',
                step1: '1. Scan this QR code with your authentication app',
                step2: '2. Enter the verification code',
                orEnterCode: 'Or enter this code:',
                verify: 'Verify'
            },
            backup: {
                title: 'Backup codes',
                description: 'Keep these codes in a safe place. They will allow you to sign in if you lose access to your authentication app.',
                copy: 'Copy',
                saved: 'I have saved my codes'
            }
        },
        sessions: {
            title: 'Active sessions',
            subtitle: 'Manage your active connections',
            view: 'View sessions',
            unknownDevice: 'Unknown device',
            lastActive: 'Last activity',
            current: 'Current session',
            revokeAll: 'Sign out all other sessions',
            confirmRevokeAll: 'Sign out all other sessions?'
        },
        connections: {
            title: 'Linked accounts',
            subtitle: 'Connect your accounts to sign in faster',
            notConnected: 'Not connected',
            connect: 'Connect',
            disconnect: 'Disconnect',
            confirmDisconnect: 'Disconnect your {{provider}} account?'
        },
        success: {
            updated: 'Profile updated',
            passwordChanged: 'Password changed',
            twoFAEnabled: 'Two-factor authentication enabled',
            twoFADisabled: 'Two-factor authentication disabled',
            codesCopied: 'Codes copied',
            accountDisconnected: '{{provider}} account disconnected',
            sessionRevoked: 'Session revoked',
            allSessionsRevoked: 'All sessions have been revoked'
        },
        errors: {
            loadFailed: 'Error loading profile',
            avatarTooLarge: 'Image must not exceed 2 MB',
            saveFailed: 'Error saving',
            passwordMismatch: 'Passwords do not match',
            passwordTooShort: 'Password must be at least 8 characters',
            passwordChangeFailed: 'Error changing password',
            setup2FAFailed: 'Error setting up 2FA',
            invalid2FACode: 'Enter a 6-digit code',
            invalidCode: 'Invalid code',
            disable2FAFailed: 'Error disabling',
            disconnectFailed: 'Error disconnecting',
            loadSessionsFailed: 'Error loading sessions',
            revokeFailed: 'Error revoking'
        }
    },

    // Proposal Form
    proposalForm: {
        title: 'Suggest an addition',
        subtitle: 'Suggest new categories, tags or game versions',
        newProposal: 'New proposal',
        myProposals: 'My proposals',
        forGame: 'For',
        rejectionReason: 'Reason',
        empty: 'You have not made any proposals yet',
        success: 'Proposal sent!',
        types: {
            tag: 'Tag',
            category: 'Category',
            version: 'Version',
            gameVersion: 'Game version'
        },
        status: {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected'
        },
        form: {
            type: 'Type',
            game: 'Related game',
            selectGame: '-- Choose a game --',
            name: 'Name',
            versionNumber: 'Version number',
            versionPlaceholder: 'Ex: 1.20.4, b3258...',
            tagPlaceholder: 'Ex: HD, Optimized, Animated...',
            categoryPlaceholder: 'Ex: Vehicles, Buildings...',
            justification: 'Justification',
            justificationPlaceholder: 'Explain why this addition would be useful...',
            submit: 'Submit proposal'
        },
        errors: {
            fillRequired: 'Please fill in all required fields',
            submitFailed: 'Error submitting'
        }
    },

    // Purchases
    purchases: {
        title: 'My Purchases',
        subtitle: 'Find all your purchased products and download them anytime',
        searchPlaceholder: 'Search my purchases...',
        purchasedOn: 'Purchased on',
        viewProduct: 'View product',
        download: 'Download',
        stats: {
            purchased: 'Products purchased',
            downloads: 'Downloads'
        },
        empty: {
            title: 'No purchases',
            noResults: 'No results',
            description: 'You have not purchased any products yet',
            tryOtherTerms: 'Try other search terms',
            discover: 'Discover products'
        },
        success: {
            downloadStarted: 'Download started'
        },
        errors: {
            loadFailed: 'Error loading purchases',
            downloadFailed: 'Error downloading'
        }
    },

    // Register
    register: {
        title: 'Create an account',
        subtitle: 'Join the HytModel community',
        username: 'Username',
        usernamePlaceholder: 'your_username',
        email: 'Email',
        emailPlaceholder: 'you@example.com',
        password: 'Password',
        confirmPassword: 'Confirm password',
        submit: 'Create my account',
        or: 'or',
        hasAccount: 'Already have an account?',
        login: 'Sign in',
        success: 'Account created successfully!',
        requirements: {
            minLength: 'At least 8 characters',
            uppercase: 'One uppercase letter',
            number: 'One number'
        },
        acceptTerms: {
            prefix: 'I accept the',
            terms: 'terms of service',
            and: 'and the',
            privacy: 'privacy policy'
        },
        errors: {
            fillAllFields: 'Please fill in all fields',
            passwordMismatch: 'Passwords do not match',
            passwordInvalid: 'Password does not meet criteria',
            acceptTerms: 'Please accept the terms of service',
            registerFailed: 'Error registering'
        }
    },

    // Seller Profile
    sellerProfile: {
        catalog: 'Catalog',
        memberSince: 'Member since',
        badges: {
            affiliated: 'Affiliated'
        },
        stats: {
            products: 'Products',
            sales: 'Sales',
            avgRating: 'Average rating',
            totalViews: 'Total views'
        },
        social: {
            website: 'Website'
        },
        tabs: {
            products: 'Products',
            bundles: 'Bundles'
        },
        bundles: {
            others: 'others',
            productsIncluded: 'products included'
        },
        filters: {
            search: 'Search...',
            allGames: 'All games',
            allCategories: 'All categories'
        },
        sort: {
            newest: 'Newest',
            oldest: 'Oldest',
            priceAsc: 'Price: low to high',
            priceDesc: 'Price: high to low',
            popular: 'Most popular',
            rating: 'Best rated'
        },
        empty: {
            title: 'No products',
            noMatch: 'No products match your criteria',
            noProducts: 'This seller has no products yet',
            resetFilters: 'Reset filters'
        },
        notFound: {
            title: 'Seller not found',
            description: 'This profile does not exist or is no longer available',
            backToProducts: 'Back to products'
        },
        errors: {
            notFound: 'Seller not found'
        }
    },

    // Seller Proposals
    sellerProposals: {
        title: 'My proposals',
        subtitle: 'Suggest new categories, tags or versions',
        newProposal: 'New proposal',
        filter: 'Filter',
        confirmDelete: 'Delete this proposal?',
        rejectionReason: 'Rejection reason',
        proposedOn: 'Proposed on',
        types: {
            category: 'Category',
            tag: 'Tag',
            version: 'Version',
            categoryDesc: 'A new product category',
            tagDesc: 'A tag to filter products',
            versionDesc: 'A game version/framework'
        },
        status: {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected'
        },
        stats: {
            total: 'Total',
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected'
        },
        filters: {
            all: 'All',
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected'
        },
        modal: {
            title: 'Suggest an addition',
            proposalType: 'Proposal type',
            game: 'Related game',
            selectGame: 'Select a game...',
            proposedName: 'Proposed name',
            justification: 'Justification',
            justificationPlaceholder: 'Explain why this addition would be useful...',
            characters: 'characters',
            info: 'Your proposal will be reviewed by our team. You will be notified of the decision.',
            send: 'Send',
            placeholders: {
                category: 'Ex: Interiors, Accessories...',
                tag: 'Ex: Drift, Tuning, Luxury...',
                version: 'Ex: ox_inventory, ESX Legacy...',
                default: 'Enter a name...'
            }
        },
        empty: {
            title: 'No proposals',
            noStatus: 'No proposals with this status',
            description: 'Suggest new categories, tags or versions to enrich the platform!',
            makeProposal: 'Make a proposal'
        },
        success: {
            sent: 'Proposal sent!',
            deleted: 'Proposal deleted'
        },
        errors: {
            fillRequired: 'Please fill in all required fields',
            selectGame: 'Please select a game',
            sendFailed: 'Error sending',
            deleteFailed: 'Error deleting'
        }
    },

    // Success (payment)
    success: {
        title: 'Payment successful!',
        subtitle: 'Thank you for your purchase. Your models are now available for download.',
        recentPurchases: 'Your recent purchases',
        download: 'Download',
        noPurchases: 'No recent purchases found',
        allPurchases: 'All my purchases',
        invoices: 'My invoices',
        continue: 'Continue'
    },

    // Upload
    upload: {
        title: 'Add a product',
        subtitle: 'Share your creation with the community',
        submit: 'Add product',
        uploading: 'Uploading...',
        success: 'Product added successfully! It will be visible after validation.',
        file: {
            title: 'Product file',
            dragHere: 'Drag your file here',
            orClick: 'or click to browse (.zip, .rar, .fbx, .obj, .blend)'
        },
        images: {
            title: 'Product images',
            hint: 'Add up to 10 images. Click on an image to set it as the main image.',
            recommendations: 'Recommendations',
            recommendationsText: 'Square or 4:3 format, ideal dimensions 1200x1200 px or 1200x900 px. Minimum 400x400 px, maximum 5 MB per image.',
            primary: 'Primary',
            setAsPrimary: 'Set as primary',
            add: 'Add',
            errors: {
                maxImages: 'Maximum 10 images allowed',
                tooLarge: '{{name}} is too large (max 5MB)',
                tooSmall: '{{name}} is too small (minimum 400x400 pixels)',
                invalid: '{{name}} is not a valid image'
            }
        },
        info: {
            title: 'Information',
            productTitle: 'Title',
            titlePlaceholder: 'Ex: HD Texture Pack',
            description: 'Description',
            descriptionPlaceholder: 'Describe your product...',
            price: 'Price (€)',
            minPrice: 'minimum €5'
        },
        youtube: {
            title: 'YouTube Video',
            invalid: 'Invalid YouTube URL',
            preview: 'Preview'
        },
        gameCategory: {
            title: 'Game & Category',
            game: 'Game',
            selectGame: 'Select a game',
            category: 'Category',
            selectCategory: 'Select a category',
            compatibleVersions: 'Compatible versions'
        },
        dependencies: {
            title: 'Dependencies',
            subtitle: 'Products or resources required for your product to work',
            add: 'Add',
            none: 'No dependencies',
            noneHint: 'Add dependencies if your product requires others',
            required: 'Required',
            recommended: 'Recommended',
            mandatory: 'Mandatory',
            optional: 'Optional',
            siteProduct: 'Site product',
            version: 'Version',
            by: 'by',
            latestVersion: 'Latest version',
            success: {
                added: 'Dependency added',
                proposed: 'Proposal sent! It will be reviewed by the team.'
            },
            errors: {
                selectDep: 'Select a dependency'
            },
            modal: {
                title: 'Add a dependency',
                tabs: {
                    predefined: 'Predefined',
                    product: 'Site product',
                    propose: 'Propose'
                },
                searchDep: 'Search for a dependency...',
                searchProduct: 'Search for a product...',
                noPredefined: 'No dependencies available for this game',
                proposeHint: 'Propose one in the "Propose" tab',
                noDepFound: 'No dependency found for "{{query}}"',
                noProducts: 'No other products available for this game',
                noProductFound: 'No product found',
                selectVersion: 'Select a version',
                loadingVersions: 'Loading versions...',
                noVersions: 'No versions available',
                latestByDefault: 'Latest version will be used by default',
                autoUpdate: 'Always automatically up to date',
                current: 'Current',
                proposeInfo: 'Propose a new dependency. It will be reviewed by our team before being added.',
                depName: 'Dependency name',
                depNamePlaceholder: 'Ex: Fabric, Forge, OptiFine...',
                logo: 'Logo',
                requiredVersion: 'Required version',
                requiredVersionPlaceholder: 'Ex: 1.20+, 2.0.0 minimum...',
                note: 'Note',
                notePlaceholder: 'Additional information...',
                propose: 'Propose'
            }
        },
        errors: {
            mustBeCreator: 'You must be a creator to add products',
            selectFile: 'Please select a file',
            enterTitle: 'Please enter a title',
            minPrice: 'Minimum price is €5',
            selectGame: 'Please select a game',
            selectCategory: 'Please select a category',
            invalidYoutube: 'Invalid YouTube URL',
            uploadFailed: 'Error uploading'
        }
    },

    // Edit Product
    editProduct: {
        title: 'Edit product',
        subtitle: 'Edit your product information',
        backToProducts: 'Back to my products',
        saveAndSubmit: 'Save and submit',
        saving: {
            saving: 'Saving...',
            images: 'Uploading images...'
        },
        fileVersions: {
            title: 'File versions',
            subtitle: 'Manage different versions of your resource',
            newVersion: 'New version',
            addVersion: 'Add a version',
            main: 'Main',
            downloads: 'downloads',
            releaseNotes: 'Release notes',
            compatibleWith: 'Compatible with',
            setAsMain: 'Set as main',
            mainNotDeletable: 'Main version cannot be deleted',
            confirmDelete: 'Delete this version? This action is irreversible.',
            empty: {
                title: 'No versions',
                description: 'Add your first file version'
            },
            modal: {
                createTitle: 'New version',
                editTitle: 'Edit version',
                versionNumber: 'Version number',
                versionPlaceholder: 'Ex: 1.0.0, 2.1.3...',
                file: 'File',
                clickToSelect: 'Click to select',
                fileFormats: 'ZIP, RAR, 7Z (max 500MB)',
                compatibleVersions: 'Compatible game versions',
                changelog: 'Release notes (changelog)',
                changelogPlaceholder: 'Describe the changes in this version...',
                mainVersion: 'Main version',
                mainVersionDescription: 'This version will be downloaded by default',
                mainVersionHint: 'Cannot remove main status. Set another version as main first.'
            },
            success: {
                added: 'Version added',
                updated: 'Version updated',
                deleted: 'Version deleted',
                mainUpdated: 'Main version updated'
            },
            errors: {
                versionRequired: 'Version number required',
                fileRequired: 'File required'
            }
        },
        dependencies: {
            title: 'Dependencies',
            subtitle: 'Products or resources required for your product',
            gameLinked: 'Dependencies are linked to the game',
            selected: 'selected',
            empty: 'No dependencies',
            required: 'Required',
            recommended: 'Recommended',
            siteProduct: 'Site product',
            version: 'Version',
            latestVersion: 'Latest version',
            confirmDelete: 'Delete this dependency?',
            tabs: {
                predefined: 'Predefined',
                siteProduct: 'Site product',
                propose: 'Propose'
            },
            modal: {
                title: 'Add a dependency',
                game: 'Game',
                selectDependency: 'Select a dependency',
                searchDependency: 'Search for a dependency...',
                noDependencies: 'No dependencies available for this game',
                proposeHint: 'Propose one in the "Propose" tab',
                noResults: 'No dependency found for',
                selectProduct: 'Select a site product',
                searchProduct: 'Search for a product...',
                noProducts: 'No other products available for this game',
                noProductResults: 'No product found',
                productSelected: 'Product selected',
                selectVersion: 'Select a version',
                loadingVersions: 'Loading versions...',
                noVersions: 'No versions available',
                latestDefault: 'Latest version will be used by default',
                autoUpdate: 'Always automatically up to date',
                current: 'Current',
                proposeInfo: 'Propose a new dependency. It will be reviewed by our team.',
                name: 'Name',
                namePlaceholder: 'Ex: Fabric, Forge...',
                logo: 'Logo (optional)',
                requiredVersion: 'Required version (optional)',
                versionPlaceholder: 'Ex: 1.20+...',
                note: 'Note (optional)',
                notePlaceholder: 'Additional info...',
                propose: 'Propose'
            },
            success: {
                added: 'Dependency added',
                deleted: 'Dependency deleted',
                proposed: 'Proposal sent!'
            },
            errors: {
                selectDependency: 'Select a dependency'
            }
        },
        images: {
            title: 'Product images',
            clickToSetPrimary: 'Click on an image to set it as the main image.',
            recommendations: 'Recommendations',
            formatHint: 'Square or 4:3 format, ideal dimensions 1200x1200 px or 1200x900 px. Minimum 400x400 px, maximum 5 MB per image.',
            primary: 'Primary',
            restore: 'Restore',
            new: 'New',
            success: {
                primaryUpdated: 'Primary image updated'
            },
            errors: {
                maxImages: 'Maximum 10 images allowed',
                tooLarge: '{{name}} is too large (max 5MB)',
                tooSmall: '{{name}} is too small (minimum 400x400 pixels)',
                invalid: '{{name}} is not a valid image',
                updateFailed: 'Error updating'
            }
        },
        info: {
            title: 'Information',
            productTitle: 'Title',
            titlePlaceholder: 'Ex: HD Texture Pack',
            description: 'Description',
            descriptionPlaceholder: 'Describe your product...',
            price: 'Price (€)',
            minPrice: 'minimum €5'
        },
        youtube: {
            title: 'YouTube Video',
            invalid: 'Invalid YouTube URL',
            preview: 'Preview'
        },
        gameCategory: {
            title: 'Game & Category',
            game: 'Game',
            selectGame: 'Select a game',
            category: 'Category',
            selectCategory: 'Select a category',
            compatibleVersions: 'Compatible versions'
        },
        tags: {
            title: 'Tags'
        },
        revalidation: {
            title: 'Revalidation required',
            description: 'Any modification to your product will require new validation by our team. Your product will be temporarily hidden until approved.'
        },
        success: {
            updated: 'Product updated! It will be visible after validation.'
        },
        errors: {
            unauthorized: 'You are not authorized to edit this product',
            notFound: 'Product not found',
            titleRequired: 'Please enter a title',
            minPrice: 'Minimum price is €5',
            gameRequired: 'Please select a game',
            invalidYoutube: 'Invalid YouTube URL',
            updateFailed: 'Error updating'
        }
    },

    // Download Version Selector
    downloadSelector: {
        download: 'Download',
        downloadVersion: 'Download v{{version}}',
        filterByGameVersion: 'Filter by game version',
        allVersions: 'All versions',
        fileVersion: 'File version',
        selectVersion: 'Select a version',
        latest: 'Latest',
        noCompatibleVersion: 'No compatible version',
        viewAllVersions: 'View all versions',
        compatibleWith: 'Compatible with:',
        versionsAvailable: '{{count}} versions available',
        success: {
            started: 'Download started'
        },
        errors: {
            selectVersion: 'Select a version',
            downloadFailed: 'Download error'
        }
    },

    // Dashboard
    dashboard: {
        greeting: 'Hello, {{username}}',
        welcomeMessage: 'Welcome to your dashboard',
        addProduct: 'Add a product',
        tabs: {
            overview: 'Overview',
            customOrders: 'Custom orders',
            proposals: 'Proposals',
            dependencies: 'Dependencies',
            bundles: 'Bundles'
        },
        quickActions: {
            myPurchases: 'My purchases',
            productsCount: '{{count}} products',
            invoices: 'Invoices',
            viewAll: 'View all',
            myProducts: 'My products',
            manage: 'Manage',
            settings: 'Settings',
            configure: 'Configure'
        },
        stats: {
            totalRevenue: 'Total revenue',
            totalSales: 'Total sales',
            lastSale: 'Last sale',
            lastPayout: 'Last payout',
            none: 'None'
        },
        customOrdersCta: {
            title: '{{count}} custom request(s) available',
            description: 'Clients are looking for your skills! Make an offer and land new orders.'
        },
        proposalsCta: {
            title: 'Propose your ideas',
            description: 'Suggest new categories, tags or versions to enrich the platform!'
        },
        stripe: {
            title: 'Set up your payments',
            description: 'Connect your Stripe account to receive payments automatically.',
            connect: 'Connect Stripe',
            connecting: 'Connecting...'
        },
        recentSales: {
            title: 'Recent sales',
            viewAll: 'View all',
            product: 'Product'
        },
        recentPurchases: {
            title: 'My recent purchases',
            viewAll: 'View all'
        },
        becomeCreator: {
            title: 'Become a creator',
            description: 'Sell your creations and earn up to 90% on each sale.',
            learnMore: 'Learn more'
        },
        dependencies: {
            title: 'Dependency proposals',
            subtitle: 'Propose new dependencies for products',
            propose: 'Propose',
            reason: 'Reason',
            proposedOn: 'Proposed on',
            confirmDelete: 'Delete this proposal?',
            whatIs: {
                title: 'What is a dependency?',
                description: 'A dependency is an external resource needed to run a product (e.g., Fabric, Forge, OptiFine for Minecraft). Propose missing dependencies and our team will add them after validation.'
            },
            empty: {
                title: 'No proposals',
                description: 'Propose a missing dependency for products'
            },
            status: {
                pending: 'Pending',
                approved: 'Approved',
                rejected: 'Rejected'
            },
            modal: {
                title: 'Propose a dependency',
                logo: 'Logo (optional)',
                clickToUpload: 'Click to upload',
                logoFormat: 'PNG, JPG (max 2MB)',
                name: 'Name',
                namePlaceholder: 'Ex: Fabric, Forge, OptiFine...',
                game: 'Game',
                selectGame: 'Select a game',
                description: 'Description (optional)',
                descriptionPlaceholder: 'Short description...',
                website: 'Website (optional)'
            },
            success: {
                proposed: 'Proposal sent!',
                deleted: 'Proposal deleted'
            },
            errors: {
                logoTooLarge: 'Logo too large (max 2MB)',
                nameAndGameRequired: 'Name and game required'
            }
        },
        errors: {
            stripeConnect: 'Error connecting to Stripe',
            generic: 'Error'
        }
    },

    // Custom Request Detail
    customRequestDetail: {
        backToRequests: 'Back to requests',
        createdOn: 'Created on',
        description: 'Description',
        attachments: 'Attachments',
        offersReceived: 'Offers received',
        conversations: 'Conversations',
        information: 'Information',
        game: 'Game',
        category: 'Category',
        budget: 'Budget',
        deadline: 'Deadline',
        orders: 'orders',
        days: 'day(s)',
        contact: 'Contact',
        reject: 'Reject',
        accept: 'Accept',
        confirmAccept: 'Accept this offer? Other offers will be automatically rejected.',
        confirmReject: 'Reject this offer?',
        status: {
            pending: 'Pending validation',
            approved: 'Looking for creator',
            assigned: 'Creator assigned',
            inProgress: 'In progress',
            awaitingFinalPayment: 'Awaiting final payment',
            completed: 'Completed',
            cancelled: 'Cancelled',
            rejected: 'Rejected'
        },
        offerStatus: {
            pending: 'Pending',
            accepted: 'Accepted',
            rejected: 'Rejected',
            withdrawn: 'Withdrawn'
        },
        pendingValidation: {
            title: 'Pending validation',
            description: 'Our team is reviewing your request. You will be notified once it is approved.'
        },
        rejected: {
            title: 'Request rejected',
            reason: 'Reason:'
        },
        searchingCreator: {
            title: 'Looking for creator',
            description: 'Your request is visible to our affiliated creators. You will receive offers soon!'
        },
        goodToKnow: {
            title: 'Good to know',
            payment: 'Payment in 2 installments: 50% + 50%',
            cancellation: 'Cancellation: 50% of deposit refunded',
            files: 'Files accessible after full payment'
        },
        success: {
            offerAccepted: 'Offer accepted! You can now proceed to payment.',
            offerRejected: 'Offer rejected'
        },
        errors: {
            notFound: 'Request not found',
            acceptFailed: 'Error accepting',
            conversationFailed: 'Error creating conversation',
            generic: 'Error'
        }
    },

    // Custom Orders (Client Page)
    customOrders: {
        title: 'Custom orders',
        subtitle: 'Request a custom creation from our creators',
        newRequest: 'New request',
        offers: 'offer(s)',
        by: 'by',
        progress: 'Progress',
        paid50: '50% paid',
        paid100: '100% paid',
        status: {
            pending: 'Pending validation',
            approved: 'Looking for creator',
            assigned: 'Creator assigned',
            inProgress: 'In progress',
            awaitingFinalPayment: 'Awaiting final payment',
            completed: 'Completed',
            cancelled: 'Cancelled',
            rejected: 'Rejected'
        },
        howItWorks: {
            title: 'How does it work?',
            step1: {
                title: 'Describe your need',
                description: 'Detail your project'
            },
            step2: {
                title: 'Receive offers',
                description: 'Our creators will make proposals'
            },
            step3: {
                title: 'Pay 50% deposit',
                description: 'Work begins'
            },
            step4: {
                title: 'Pay the balance',
                description: 'Receive your files'
            }
        },
        tabs: {
            myRequests: 'My requests',
            myOrders: 'My orders'
        },
        empty: {
            noRequests: 'No requests',
            noRequestsDescription: 'You have not made any custom requests yet',
            createFirst: 'Create my first request',
            noOrders: 'No orders',
            noOrdersDescription: 'You have no orders in progress'
        },
        errors: {
            loadFailed: 'Error loading'
        }
    },

    // Custom Order Detail
    orderDetail: {
        beforeOrder: 'before order',
        file: 'File',
        orderWith: 'Order with',
        noMessages: 'No messages',
        messagePlaceholder: 'Write your message...',
        disputeBanner: 'Dispute in progress - Continue communicating to resolve the issue',
        details: 'Details',
        totalPrice: 'Total price',
        deposit: 'Deposit (50%)',
        balance: 'Balance (50%)',
        pending: 'pending',
        estimatedDelivery: 'Estimated delivery',
        pay: 'Pay',
        finalFiles: 'Final files',
        status: {
            awaitingPayment: 'Awaiting payment',
            inProgress: 'In progress',
            pendingReview: 'Pending review',
            awaitingFinalPayment: 'Final payment required',
            completed: 'Completed',
            disputed: 'Dispute',
            cancelled: 'Cancelled',
            refunded: 'Refunded'
        },
        paymentRequired: {
            title: 'Payment required',
            description: 'Pay the 50% deposit to start the order'
        },
        deliver: {
            title: 'Deliver the order',
            description: 'Upload your final files then deliver',
            addMore: 'Add more files',
            selectFiles: 'Select files',
            messagePlaceholder: 'Delivery message (optional)...',
            button: 'Deliver ({{count}} file(s))',
            defaultMessage: 'Delivery completed!'
        },
        review: {
            title: 'Delivery received',
            description: 'Review the work and validate or request modifications',
            validate: 'Validate',
            requestRevisions: 'Request revisions'
        },
        finalPayment: {
            title: 'Final payment',
            description: 'Pay the balance to finalize the order and access the files'
        },
        withdraw: {
            title: 'Withdrawal',
            description: 'You can cancel the order in progress.',
            refund25: 'You get back 25% of the deposit',
            creator20: 'Creator receives 20% (work done)',
            button: 'Withdraw'
        },
        problem: {
            title: 'A problem?',
            description: 'If the files do not work properly, report it.',
            previousClaims: '{{count}} previous claim(s) resolved',
            button: 'Report a problem'
        },
        claim: {
            title: 'Claim in progress',
            creatorMessage: 'The client reported a problem. Please send a fix.',
            clientMessage: 'Your claim is being processed.'
        },
        fixes: {
            title: 'Fixes received ({{count}})',
            version: 'Version',
            accepted: 'Accepted',
            rejected: 'Rejected',
            accept: 'Accept',
            reject: 'Reject'
        },
        sendFix: {
            title: 'Send a fix',
            addFiles: 'Add files',
            selectFiles: 'Select fixed files',
            messagePlaceholder: 'Explain the corrections made...',
            button: 'Send the fix'
        },
        completed: {
            title: 'Order completed!',
            thanks: 'Thank you for your trust'
        },
        success: {
            delivered: 'Order delivered!',
            approved: 'Delivery validated!',
            revisionRequested: 'Revision request sent',
            withdrawn: 'Withdrawal completed. Refund: €{{amount}}',
            claimOpened: 'Claim sent. The creator and our team have been notified.',
            fixSent: 'Fix sent to client',
            fixAccepted: 'Fix accepted! Claim closed.',
            feedbackSent: 'Feedback sent to creator'
        },
        errors: {
            notFound: 'Order not found',
            sendFailed: 'Error sending',
            maxFiles: 'Maximum 5 files',
            noDeliveryFiles: 'Please add at least one file to deliver',
            deliveryFailed: 'Error delivering',
            paymentRedirect: 'Error redirecting to payment',
            noFixFiles: 'Please add fixed files',
            generic: 'Error'
        }
    },

    // Custom Order Conversation
    conversation: {
        file: 'File',
        close: 'Close',
        reject: 'Reject',
        accept: 'Accept',
        delay: 'Delay',
        days: 'day(s)',
        makeOffer: 'Make an offer',
        modifyOffer: 'Modify offer',
        awaitingClientResponse: 'Awaiting client response',
        offerAccepted: 'Offer accepted!',
        payDepositToStart: 'Pay the 50% deposit to start',
        pay: 'Pay',
        redirectingToPayment: 'Redirecting to payment...',
        noMessages: 'No messages',
        startConversation: 'Start the conversation!',
        conversationClosed: 'Conversation closed',
        willBeDeleted: 'This conversation will be automatically deleted',
        messagePlaceholder: 'Write your message...',
        confirmAcceptOffer: 'Accept this offer? You will then need to pay 50% of the amount.',
        status: {
            closed: 'Closed',
            offerAccepted: 'Offer accepted',
            offer: 'Offer'
        },
        offerModal: {
            title: 'Make an offer',
            editTitle: 'Modify offer',
            priceLabel: 'Price (€)',
            daysLabel: 'Delay (days)',
            messageLabel: 'Message (optional)',
            messagePlaceholder: 'Additional details...',
            send: 'Send',
            errors: {
                minPrice: 'Minimum price: €5',
                minDays: 'Minimum delay: 1 day'
            }
        },
        rejectModal: {
            title: 'Reject offer',
            reasonLabel: 'Reason (optional)',
            reasonPlaceholder: 'Explain why you are rejecting...',
            closeDefinitely: 'Close permanently',
            closeHint: 'Conversation will be deleted in 48h',
            reject: 'Reject',
            rejectAndClose: 'Reject and close'
        },
        closeModal: {
            title: 'Close conversation',
            warning: 'This action is final. If you have a pending offer, it will be withdrawn.',
            reasonLabel: 'Reason (optional)',
            reasonPlaceholder: 'Explain why you are closing...',
            close: 'Close'
        },
        success: {
            offerSent: 'Offer sent!',
            offerAccepted: 'Offer accepted!',
            offerRejected: 'Offer rejected',
            conversationClosed: 'Conversation closed'
        },
        errors: {
            loadFailed: 'Error loading',
            sendFailed: 'Error sending',
            generic: 'Error',
            maxFiles: 'Maximum 5 files'
        }
    },

    // Creator Custom Orders
    creatorCustomOrders: {
        budget: 'Budget',
        toDefine: 'To be defined',
        description: 'Description',
        deadline: 'Deadline',
        attachments: 'Attachments',
        file: 'File',
        offersReceived: '{{count}} offer(s) received',
        messages: 'Messages',
        contact: 'Contact',
        makeOffer: 'Make an offer',
        offerSent: 'Offer sent',
        client: 'Client',
        offer: 'Offer',
        offerRejected: 'Offer rejected',
        amount: 'Amount',
        deliver: 'Deliver',
        requestStatus: {
            available: 'Available',
            assigned: 'Assigned',
            inProgress: 'In progress',
            completed: 'Completed'
        },
        orderStatus: {
            awaitingPayment: 'Awaiting payment',
            inProgress: 'In progress',
            awaitingFinal: 'Awaiting balance',
            completed: 'Completed',
            cancelled: 'Cancelled',
            disputed: 'Dispute'
        },
        badges: {
            inDiscussion: 'In discussion',
            offerSent: 'Offer sent',
            accepted: 'Accepted'
        },
        offerModal: {
            title: 'Make an offer',
            for: 'For',
            clientBudget: 'Client budget',
            notSpecified: 'Not specified',
            yourPrice: 'Your price (€)',
            paymentInfo: 'Client will pay 50% on order, 50% on delivery',
            estimatedDays: 'Estimated delay (days)',
            clientDeadline: 'Client deadline',
            messageLabel: 'Message to client',
            messagePlaceholder: 'Present your approach, your skills, ask questions if needed...',
            minChars: '{{count}}/20 minimum characters',
            send: 'Send offer',
            success: 'Offer sent!',
            errors: {
                minPrice: 'Minimum price: €5',
                minDays: 'Minimum delay: 1 day',
                messageTooShort: 'Message too short (min 20 characters)',
                sendFailed: 'Error sending'
            }
        },
        payment: {
            deposit: 'Deposit (50%)',
            balance: 'Balance (50%)',
            paid: '✓ Paid',
            pending: 'Pending',
            afterDelivery: 'After delivery'
        },
        delivery: {
            placeholder: 'Delivery message, instructions, download links...',
            confirm: 'Confirm delivery',
            messageRequired: 'Add a delivery message',
            success: 'Delivery sent! Awaiting final payment.',
            error: 'Error'
        },
        awaitingFinalPayment: {
            title: 'Awaiting final payment',
            description: 'Client must pay the balance to finalize'
        },
        orderCompleted: {
            title: 'Order completed!',
            description: 'Payment has been transferred to your account'
        },
        stats: {
            availableRequests: 'Available requests',
            inProgress: 'In progress',
            completed: 'Completed',
            customRevenue: 'Custom revenue',
            unreadMessages: 'Unread messages'
        },
        tabs: {
            availableRequests: 'Available requests',
            negotiations: 'Negotiations',
            myOrders: 'My orders'
        },
        empty: {
            noRequests: 'No requests available',
            requestsWillAppear: 'New requests will appear here',
            noNegotiations: 'No negotiations in progress',
            contactClients: 'Contact clients to start negotiating',
            noOrders: 'No orders',
            ordersWillAppear: 'Your custom orders will appear here'
        },
        errors: {
            conversationFailed: 'Error creating conversation'
        }
    },

    // Checkout Success
    checkoutSuccess: {
        title: 'Payment successful!',
        description: 'Thank you for your purchase. Your products are now available.',
        recentPurchases: 'Your recent purchases',
        loadingPurchases: 'Loading your purchases...',
        download: 'Download',
        purchasesAppearSoon: 'Your purchases will appear in a few moments...',
        refresh: 'Refresh',
        invoiceSent: 'Invoice sent',
        invoiceDescription: 'An invoice has been sent to your email address. You can also find your purchases in your personal space.',
        viewPurchases: 'View my purchases',
        continueShopping: 'Continue shopping'
    },

    // Cart
    cart: {
        title: 'My cart',
        productCount: '{{count}} product(s)',
        clearCart: 'Clear cart',
        confirmClear: 'Do you really want to clear your cart?',
        checkout: 'Proceed to checkout',
        securePayment: 'Secure payment by Stripe',
        empty: {
            title: 'Your cart is empty',
            description: 'Discover our collection of premium products',
            explore: 'Explore products'
        },
        summary: {
            title: 'Summary',
            subtotal: 'Subtotal',
            vatIncluded: 'VAT included',
            total: 'Total'
        },
        errors: {
            checkoutFailed: 'Error during checkout'
        }
    },

    // Cancel (Payment)
    cancel: {
        title: 'Payment cancelled',
        description: 'Your payment has been cancelled. No amount has been charged to your account. Your items are still in your cart.',
        problemTitle: 'A problem?',
        problemDescription: 'If you encountered a problem during payment, please try again. If the problem persists, contact our support.',
        backToCart: 'Back to cart',
        continueShopping: 'Continue shopping',
        retryHint: 'You can retry payment at any time'
    },

    // Bundle Detail
    bundleDetail: {
        includedProducts: 'Included products ({{count}})',
        included: 'Included',
        youSave: 'You save €{{amount}}',
        discountApplied: 'Discount applied',
        products: 'Products',
        yourBundle: 'This is your bundle',
        bundlePurchased: 'Bundle purchased',
        viewPurchases: 'View my purchases',
        buyBundle: 'Buy bundle',
        purchaseInfo: 'By purchasing this bundle, you get all included products.',
        validUntil: 'Offer valid until {{date}}',
        success: {
            purchased: 'Bundle purchased successfully!'
        },
        errors: {
            notFound: 'Bundle not found',
            loginRequired: 'Log in to purchase',
            purchaseFailed: 'Error purchasing'
        }
    },

    // Become Creator
    becomeCreator: {
        title: 'Become a seller',
        subtitle: 'Join our community of creators and sell your creations on HytModel. Fill out this form to submit your application.',
        backToHome: 'Back to home',
        types: {
            nonAffiliated: {
                title: 'Non-affiliated',
                subtitle: 'Standard seller'
            },
            affiliated: {
                title: 'Affiliated',
                subtitle: 'Official partner'
            },
            hytStudio: {
                title: 'HytStudio',
                subtitle: 'Internal team',
                description: 'Official HytModel creations'
            },
            popular: 'POPULAR',
            ofRevenue: 'of your revenue',
            forPlatform: 'for the platform',
            commission: 'Platform commission: {{percent}}%'
        },
        form: {
            presentYourself: 'Present yourself',
            presentPlaceholder: 'Tell us about yourself, your background and your motivations for joining HytModel...',
            yourPortfolio: 'Your portfolio',
            portfolioUrlLabel: 'Link to your portfolio (optional)',
            workDescriptionLabel: 'Describe your work and creations',
            workDescriptionPlaceholder: 'Describe the types of creations you make, your specialties, the software you use...',
            experienceLabel: 'Experience (optional)',
            experiencePlaceholder: 'How many years of experience do you have? Have you sold on other platforms?',
            socialNetworks: 'Social networks (optional)',
            website: 'Website',
            sending: 'Sending...',
            submit: 'Submit my application'
        },
        important: {
            title: 'Important',
            description: 'Your application will be reviewed by our team as soon as possible. We will contact you by email with our decision. Sellers start with "Non-affiliated" status (85% of revenue). "Affiliated" status (90%) is granted to quality creators after evaluation.'
        },
        status: {
            pendingTitle: 'Application under review',
            pendingDescription: 'Your application was submitted on {{date}}. Our team is currently reviewing it.',
            pendingHint: 'You will receive a response in the coming days.',
            approvedTitle: 'Congratulations! 🎉',
            approvedDescription: 'Your application has been approved! You can now sell on HytModel.',
            goToDashboard: 'Go to my dashboard',
            rejectedTitle: 'Application rejected',
            rejectedDescription: 'Unfortunately, your application was not accepted.',
            reason: 'Reason',
            rejectedHint: 'You can improve your portfolio and submit a new application.',
            newRequest: 'Submit a new application'
        },
        success: {
            requestSent: 'Application sent successfully!'
        },
        errors: {
            presentRequired: 'Please present yourself',
            workDescriptionRequired: 'Please describe your work',
            sendFailed: 'Error sending'
        }
    },

    // Settings (Admin)
    settings: {
        title: 'Settings',
        tabs: {
            games: 'Games',
            categories: 'Categories',
            tags: 'Tags',
            versions: 'Versions',
            dependencies: 'Dependencies'
        },
        chooseGame: '-- Choose a game --',
        clickToUpload: 'Click to upload',
        imageFormats: 'PNG, JPG, SVG (max 2MB)',
        choose: 'Choose',
        fields: {
            name: 'Name',
            description: 'Description',
            shortDescription: 'Short description...',
            website: 'Website',
            game: 'Game',
            slug: 'Slug (URL)'
        },
        actions: {
            create: 'Create',
            edit: 'Edit',
            delete: 'Delete',
            enable: 'Enable',
            disable: 'Disable'
        },
        games: {
            new: 'New game',
            newTitle: 'New game',
            editTitle: 'Edit game',
            noGames: 'No games created',
            nameLabel: 'Game name',
            namePlaceholder: 'Ex: FiveM, Minecraft...',
            iconLabel: 'Logo / Icon (square, 200x200 recommended)',
            bannerLabel: 'Banner (1920x400 recommended)',
            banner: 'Banner',
            chooseBanner: 'Choose a banner'
        },
        categories: {
            selectGame: 'Select a game to manage its categories',
            selectGameToView: 'Select a game to view its categories',
            new: 'New category',
            newTitleFor: 'New category for {{game}}',
            editTitle: 'Edit category',
            noneForGame: 'No categories for {{game}}',
            createFirst: 'Create first category',
            countForGame: '{{count}} category(ies) for {{game}}',
            namePlaceholder: 'Ex: Vehicles, Buildings...'
        },
        tags: {
            selectGame: 'Select a game to manage its tags',
            selectGameToView: 'Select a game to view its tags',
            new: 'New tag',
            newTitleFor: 'New tag for {{game}}',
            editTitle: 'Edit tag',
            searchPlaceholder: 'Search for a tag...',
            noFound: 'No tags found',
            noneForGame: 'No tags for {{game}}',
            createFirst: 'Create first tag',
            countForGame: '{{count}} tag(s) for {{game}}',
            nameLabel: 'Tag name',
            namePlaceholder: 'Ex: HD, Animated, Optimized...'
        },
        versions: {
            selectGame: 'Select a game to manage its versions',
            selectGameToView: 'Select a game to view its versions',
            new: 'New version',
            newTitleFor: 'New version for {{game}}',
            editTitle: 'Edit version',
            searchPlaceholder: 'Search for a version...',
            noFound: 'No versions found',
            noneForGame: 'No versions for {{game}}',
            createFirst: 'Create first version',
            countForGame: '{{count}} version(s) for {{game}}',
            versionLabel: 'Version',
            versionPlaceholder: 'Ex: 1.20.4, b3258, ESX 1.9...',
            versionHint: 'Enter the game version number or name'
        },
        dependencies: {
            selectGame: 'Select a game to manage its dependencies',
            selectGameToView: 'Select a game to view its dependencies',
            new: 'New dependency',
            newTitle: 'New dependency',
            editTitle: 'Edit dependency',
            searchPlaceholder: 'Search for a dependency...',
            noFound: 'No dependencies found',
            noneForGame: 'No dependencies for {{game}}',
            create: 'Create a dependency',
            disabled: 'Disabled',
            usedBy: 'Used by {{count}} product(s)',
            website: 'Website',
            logoOptional: 'Logo (optional)',
            namePlaceholder: 'Ex: Fabric, Forge, OptiFine...'
        },
        confirmDelete: {
            game: 'Delete game "{{name}}"? This may affect associated products.',
            category: 'Delete category "{{name}}"?',
            tag: 'Delete tag "{{name}}"?',
            version: 'Delete version "{{name}}"?',
            dependency: 'Delete dependency "{{name}}"?'
        },
        success: {
            gameCreated: 'Game created',
            gameModified: 'Game modified',
            gameDeleted: 'Game deleted',
            categoryCreated: 'Category created',
            categoryModified: 'Category modified',
            categoryDeleted: 'Category deleted',
            tagCreated: 'Tag created',
            tagModified: 'Tag modified',
            tagDeleted: 'Tag deleted',
            versionCreated: 'Version created',
            versionModified: 'Version modified',
            versionDeleted: 'Version deleted',
            dependencyCreated: 'Dependency created',
            dependencyModified: 'Dependency modified',
            dependencyDeleted: 'Dependency deleted',
            dependencyEnabled: 'Dependency enabled',
            dependencyDisabled: 'Dependency disabled'
        },
        errors: {
            generic: 'Error',
            loadFailed: 'Error loading',
            loadGames: 'Error loading games',
            selectGameFirst: 'Select a game first',
            nameRequired: 'Name is required',
            versionRequired: 'Version is required',
            deleteFailed: 'Error deleting',
            logoTooLarge: 'Logo too large (max 2MB)'
        }
    },

    // Sellers (Admin)
    sellers: {
        title: 'Seller management',
        types: {
            nonAffiliated: 'Non-affiliated',
            affiliated: 'Affiliated'
        },
        commission: 'Commission',
        platform: 'Platform',
        sales: 'sales',
        generated: 'generated',
        stats: {
            activeSellers: 'Active sellers',
            totalRevenue: 'Total revenue',
            commissions: 'Commissions',
            pendingRequests: 'Pending requests'
        },
        tabs: {
            requests: 'Requests',
            eligible: 'Affiliate eligible',
            activeSellers: 'Active sellers'
        },
        actions: {
            approve: 'Approve',
            reject: 'Reject',
            promoteAffiliate: 'Promote to Affiliate'
        },
        requests: {
            noPending: 'No pending requests',
            allProcessed: 'All requests have been processed',
            pending: 'Pending',
            noDescription: 'No description'
        },
        eligible: {
            noEligible: 'No eligible sellers',
            willAppearHere: 'Sellers with 1000+ sales will appear here',
            info: '{{count}} seller(s) have reached 1000+ sales and are eligible for Affiliate status (90% of revenue)'
        },
        searchPlaceholder: 'Search for a seller...',
        noSellersFound: 'No sellers found',
        table: {
            seller: 'Seller',
            type: 'Type',
            products: 'Products',
            sales: 'Sales',
            revenue: 'Revenue',
            actions: 'Actions'
        },
        modal: {
            presentation: 'Presentation',
            noPresentation: 'No presentation provided.',
            portfolio: 'Portfolio & Work',
            noPortfolioDescription: 'No work description provided.',
            experience: 'Experience',
            socialNetworks: 'Social networks',
            website: 'Website',
            requestSentOn: 'Request sent on',
            sellerTypeToAssign: 'Seller type to assign',
            rejectRequest: 'Reject request',
            rejectPlaceholder: 'Explain the reason for rejection (insufficient quality, incomplete portfolio, etc.)...',
            confirmReject: 'Confirm rejection'
        },
        success: {
            approved: 'Request approved!',
            rejected: 'Request rejected',
            typeUpdated: 'Seller type updated',
            promoted: 'Seller promoted to Affiliate!'
        },
        errors: {
            reasonRequired: 'Please enter a reason',
            approveFailed: 'Error approving',
            rejectFailed: 'Error rejecting',
            updateFailed: 'Error updating',
            promoteFailed: 'Error promoting'
        }
    },

    // Proposals (Admin)
    proposals: {
        title: 'Seller proposals',
        subtitle: 'Manage category, tag and version proposals',
        types: {
            category: 'Category',
            tag: 'Tag',
            version: 'Version',
            categories: 'Categories',
            tags: 'Tags',
            versions: 'Versions'
        },
        status: {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected'
        },
        filters: {
            label: 'Filters',
            allStatuses: 'All statuses',
            allTypes: 'All types'
        },
        actions: {
            approve: 'Approve',
            reject: 'Reject'
        },
        noProposals: 'No proposals',
        noPendingProposals: 'No pending proposals',
        noProposalsWithCriteria: 'No proposals with these criteria',
        forGame: 'For',
        rejectionReason: 'Rejection reason',
        rejectModal: {
            title: 'Reject proposal',
            description: 'Reject proposal',
            reasonLabel: 'Rejection reason (optional)',
            reasonPlaceholder: 'Explain why this proposal is rejected...'
        },
        success: {
            approved: 'Proposal approved and added!',
            rejected: 'Proposal rejected'
        },
        errors: {
            loadFailed: 'Error loading',
            approveFailed: 'Error approving',
            rejectFailed: 'Error rejecting'
        }
    },

    // Feedback (Admin)
    feedback: {
        title: 'Feedback & Reports',
        tabs: {
            proposals: 'Proposals',
            reports: 'Reports'
        },
        withSellerResponse: 'With seller response',
        types: {
            category: 'Category',
            tag: 'Tag',
            version: 'Version',
            dependency: 'Dependency'
        },
        reasons: {
            bug: 'Technical bug',
            error: 'Missing files',
            misleading: 'Misleading description',
            copyright: 'Copyright violation',
            inappropriate: 'Inappropriate content',
            other: 'Other'
        },
        status: {
            pending: 'Pending',
            reviewed: 'In progress',
            resolved: 'Resolved',
            dismissed: 'Dismissed'
        },
        filters: {
            all: 'All'
        },
        actions: {
            approveAndCreate: 'Approve and create',
            reject: 'Reject',
            resolved: 'Resolved',
            inProgress: 'In progress',
            unfounded: 'Unfounded'
        },
        proposals: {
            noProposals: 'No pending proposals',
            willAppearHere: 'Seller proposals will appear here',
            by: 'By',
            proposedOn: 'Proposed on',
            website: 'Website'
        },
        reports: {
            noReports: 'No reports',
            willAppearHere: 'Product reports will appear here',
            sellerResponse: 'Seller response',
            seller: 'Seller',
            reportedBy: 'Reported by',
            reportDescription: 'Report description',
            sellerResponseOn: 'Seller response ({{date}})',
            staffNote: 'Staff note',
            viewProduct: 'View product'
        },
        modals: {
            rejectProposal: 'Reject proposal',
            rejectDepProposal: 'Reject dependency proposal',
            rejectReasonOptional: 'Rejection reason (optional)',
            rejectReasonPlaceholder: 'Explain why this proposal is rejected...',
            rejectDepPlaceholder: 'Explain why this dependency is rejected...',
            markResolved: '✓ Mark as resolved',
            markUnfounded: '✗ Mark as unfounded',
            product: 'Product',
            reason: 'Reason',
            staffNoteOptional: 'Note for seller (optional)',
            staffNotePlaceholder: 'Add an explanatory note for the seller...',
            staffNoteHint: 'This note will be visible to the seller in their notification.',
            confirm: 'Confirm'
        },
        success: {
            proposalApproved: 'Proposal approved and created!',
            proposalRejected: 'Proposal rejected',
            reportUpdated: 'Report updated',
            depApproved: 'Dependency approved and created!',
            depRejected: 'Dependency proposal rejected'
        },
        errors: {
            generic: 'Error',
            rejectFailed: 'Error rejecting'
        }
    },

    // Dependencies (Admin)
    dependencies: {
        title: 'Dependencies',
        subtitle: 'Manage available dependencies for products',
        tabs: {
            dependencies: 'Dependencies',
            proposals: 'Proposals'
        },
        filters: {
            allGames: 'All games',
            allStatuses: 'All statuses'
        },
        status: {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected'
        },
        newDependency: 'New dependency',
        noDependencies: 'No dependencies',
        noProposals: 'No proposals',
        disabled: 'Disabled',
        usedBy: 'Used by {{count}} product(s)',
        proposedBy: 'Proposed by',
        reason: 'Reason',
        confirmDelete: 'Delete this dependency? Linked products will lose this association.',
        rejectReasonPrompt: 'Rejection reason (optional):',
        actions: {
            approve: 'Approve',
            reject: 'Reject'
        },
        modal: {
            createTitle: 'New dependency',
            editTitle: 'Edit dependency',
            logo: 'Logo',
            clickToUpload: 'Click to upload',
            logoFormats: 'PNG, JPG, SVG (max 2MB)',
            name: 'Name',
            namePlaceholder: 'Ex: Fabric, Forge, OptiFine...',
            game: 'Game',
            selectGame: 'Select a game',
            description: 'Description',
            descriptionPlaceholder: 'Short description...',
            website: 'Website',
            create: 'Create',
            update: 'Update'
        },
        success: {
            created: 'Dependency created',
            updated: 'Dependency updated',
            deleted: 'Dependency deleted',
            proposalApproved: 'Proposal approved',
            proposalRejected: 'Proposal rejected'
        },
        errors: {
            loadFailed: 'Loading error',
            logoTooLarge: 'Logo too large (max 2MB)',
            nameRequired: 'Name required',
            gameRequired: 'Game required',
            generic: 'Error'
        }
    },

    // Custom Orders (Admin)
    customOrdersAdmin: {
        title: 'Custom orders',
        status: {
            pending: 'Pending',
            approved: 'Approved',
            assigned: 'Assigned',
            inProgress: 'In progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
            rejected: 'Rejected'
        },
        orderStatus: {
            awaitingPayment: 'Awaiting payment',
            inProgress: 'In progress',
            awaitingFinal: 'Awaiting balance',
            completed: 'Completed',
            cancelled: 'Cancelled',
            disputed: 'Dispute'
        },
        stats: {
            pending: 'Pending',
            creators: 'Creators',
            inProgress: 'In progress',
            commissions: 'Commissions'
        },
        tabs: {
            requests: 'Requests',
            creators: 'Affiliated creators',
            orders: 'Orders'
        },
        filters: {
            all: 'All'
        },
        actions: {
            approve: 'Approve',
            reject: 'Reject'
        },
        requests: {
            noRequests: 'No requests',
            noRequestsWithStatus: 'No requests with status "{{status}}"',
            noRequestsInSystem: 'No requests in the system',
            by: 'By',
            offersCount: '{{count}} offer(s)',
            description: 'Description',
            game: 'Game',
            category: 'Category',
            budget: 'Budget',
            deadline: 'Deadline',
            createdAt: 'Created on'
        },
        rejectModal: {
            title: 'Reject request',
            placeholder: 'Rejection reason...'
        },
        creators: {
            affiliated: 'Affiliated',
            info: '<strong>Affiliated</strong> and <strong>HytStudio</strong> creators can receive custom requests. Manage their types in the <strong>"Active sellers"</strong> tab of the Sellers page.',
            noCreators: 'No affiliated creators',
            promoteHint: 'Promote sellers to "Affiliated" or "HytStudio" in seller management',
            products: 'Products',
            sales: 'Sales',
            revenue: 'Revenue'
        },
        orders: {
            noOrders: 'No orders',
            commission: 'Commission',
            table: {
                order: 'Order',
                client: 'Client',
                creator: 'Creator',
                price: 'Price',
                status: 'Status',
                date: 'Date'
            }
        },
        success: {
            approved: 'Request approved',
            rejected: 'Request rejected'
        },
        errors: {
            loadFailed: 'Error loading',
            approveFailed: 'Error approving',
            rejectFailed: 'Error rejecting',
            reasonRequired: 'Please enter a reason'
        }
    },

    // Analytics
    analytics: {
        title: 'Analytics',
        subtitle: 'Detailed platform statistics',
        filters: {
            label: 'Filters',
            last7days: 'Last 7 days',
            last30days: 'Last 30 days',
            last90days: 'Last 90 days',
            thisYear: 'This year',
            allGames: 'All games',
            clearFilter: 'Clear filter'
        },
        filteredFor: 'Statistics filtered for',
        selectedGame: 'Selected game',
        noData: 'No data',
        sales: 'sales',
        products: 'products',
        views: 'views',
        kpis: {
            totalRevenue: 'Total revenue',
            salesCount: '{{count}} sales',
            avgCart: 'Average cart',
            perTransaction: 'Per transaction',
            totalViews: 'Total views',
            uniqueVisitors: '{{count}} unique visitors',
            conversionRate: 'Conversion rate',
            visitorsToBuyers: 'Visitors → Buyers'
        },
        gameDetails: {
            title: 'Details for',
            topCategories: 'Best selling categories',
            topTags: 'Most popular tags',
            topVersions: 'Best selling versions',
            forThisGame: 'For this game',
            bestSellers: 'Best-selling products',
            top10For: 'Top 10 for {{game}}'
        },
        charts: {
            salesByGame: 'Sales by game',
            salesDistribution: 'Sales distribution',
            salesByCategory: 'Sales by category',
            byProductType: 'Distribution by product type',
            salesEvolution: 'Sales evolution',
            salesAndRevenue: 'Sales and revenue over period',
            salesLabel: 'Sales',
            revenueLabel: 'Revenue (€)',
            priceDistribution: 'Price distribution',
            salesByPriceRange: 'Sales distribution by price range',
            salesCount: 'Number of sales',
            popularTags: 'Most popular tags',
            bestSellingTags: 'Best-selling tags',
            mostViewedProducts: 'Most viewed products',
            topProductsBySales: 'Top products by sales',
            conversionFunnel: 'Conversion funnel',
            userJourney: 'User journey'
        }
    },

    // Admin
    admin: {
        sidebar: {
            title: 'Administration'
        },
        nav: {
            dashboard: 'Dashboard',
            pending: 'Pending',
            analytics: 'Analytics',
            users: 'Users',
            sellers: 'Sellers',
            products: 'Products',
            customOrders: 'Custom orders',
            feedback: 'Feedback',
            settings: 'Settings'
        },
        overview: {
            title: 'Overview'
        },
        stats: {
            vsLastMonth: 'vs last month',
            totalRevenue: 'Total revenue',
            platformCommission: 'Platform commission',
            sales: 'Sales',
            activeSellers: 'Active sellers',
            visits: 'Visits',
            downloads: 'Downloads',
            avgTime: 'Average time',
            reports: 'Reports',
            customOrders: 'Custom orders',
            totalReports: 'Total reported'
        },
        alerts: {
            pendingReports: '{{count}} pending report(s)',
            reportsNeedAttention: 'Some products have been reported and need your attention',
            viewReports: 'View reports',
            pendingCustomOrders: '{{count}} pending custom order(s)',
            customOrdersNeedValidation: 'Clients are waiting for their request to be validated',
            viewRequests: 'View requests'
        },
        quickActions: {
            title: 'Quick actions',
            pendingProducts: 'Pending products',
            users: 'Users',
            customOrders: 'Custom orders',
            sellers: 'Sellers'
        },
        reportsSection: {
            title: 'Reports',
            viewAll: 'View all',
            noReports: 'No reports',
            pending: 'Pending',
            underReview: 'Under review',
            processed: 'Total processed'
        },
        pending: {
            title: 'Pending products',
            noPending: 'No pending products',
            allProcessed: 'All products have been processed',
            badges: {
                corrected: 'Corrected',
                modified: 'Modified',
                new: 'New'
            },
            modifs: 'modification(s)',
            modificationsPreview: 'Modifications preview',
            viewAll: 'View all',
            descriptionModified: 'Description modified',
            previousHiddenReason: 'Previous hidden reason',
            viewModifications: 'View modifications'
        },
        modifications: {
            before: 'Before',
            after: 'After',
            empty: '(empty)',
            none: '(none)',
            changed: 'Changed',
            detailTitle: 'Modification details',
            newProduct: 'New product - No modifications',
            changesDetected: '{{count}} modification(s) detected',
            previousHiddenReason: 'Previous hidden reason',
            fields: {
                title: 'Title',
                description: 'Description',
                price: 'Price',
                game: 'Game',
                category: 'Category'
            }
        },
        users: {
            title: 'User management',
            searchPlaceholder: 'Search for a user...',
            allRoles: 'All roles',
            table: {
                user: 'User',
                email: 'Email',
                role: 'Role',
                registered: 'Registered',
                actions: 'Actions'
            },
            ban: 'Ban',
            unban: 'Unban',
            success: {
                banned: 'User banned',
                unbanned: 'User unbanned',
                roleChanged: 'Role changed'
            },
            errors: {
                banFailed: 'Error',
                roleChangeFailed: 'Error changing role'
            }
        },
        products: {
            title: 'Product management',
            count: '{{count}} product(s)',
            searchPlaceholder: 'Search by title or creator...',
            allStatuses: 'All statuses',
            noProducts: 'No products found',
            tryOtherTerms: 'Try other terms',
            noProductsInDb: 'No products in the database',
            by: 'By',
            unknown: 'Unknown',
            reason: 'Reason',
            view: 'View',
            approve: 'Approve',
            reject: 'Reject',
            hide: 'Hide',
            unhide: 'Unhide',
            delete: 'Delete',
            status: {
                approved: 'Approved',
                pending: 'Pending',
                rejected: 'Rejected',
                hidden: 'Hidden'
            },
            hideModal: {
                title: 'Hide product',
                description: 'You are about to hide "{{title}}". The seller will be notified of the reason.',
                reasonLabel: 'Reason for hiding',
                reasonPlaceholder: 'Ex: Inappropriate content, copyright, insufficient quality...'
            },
            deleteModal: {
                title: 'Delete product',
                description: 'Are you sure you want to permanently delete "{{title}}"? This action is irreversible.'
            },
            success: {
                approved: 'Product approved',
                rejected: 'Product rejected',
                hidden: 'Product hidden - Seller will be notified',
                unhidden: 'Product unhidden',
                deleted: 'Product deleted'
            },
            errors: {
                approveFailed: 'Error approving',
                rejectFailed: 'Error rejecting',
                reasonRequired: 'Please enter a reason',
                hideFailed: 'Error hiding',
                unhideFailed: 'Error unhiding',
                deleteFailed: 'Error deleting'
            }
        }
    },

    // Bundles
    bundles: {
        title: 'My Bundles',
        subtitle: 'Create bundles to increase your sales',
        createBundle: 'Create a bundle',
        confirmDelete: 'Delete this bundle?',
        stats: '{{products}} products • {{sales}} sales',
        status: {
            active: 'Active',
            inactive: 'Inactive'
        },
        empty: {
            title: 'No bundles',
            description: 'Create your first bundle to offer bundles to your customers',
            cta: 'Create my first bundle'
        },
        actions: {
            activate: 'Activate',
            deactivate: 'Deactivate',
            edit: 'Edit',
            delete: 'Delete'
        },
        modal: {
            createTitle: 'Create a bundle',
            editTitle: 'Edit bundle'
        },
        form: {
            titleLabel: 'Bundle title',
            titlePlaceholder: 'Ex: Complete Vehicle Pack',
            descriptionLabel: 'Description',
            descriptionPlaceholder: 'Describe your bundle...',
            discountTypeLabel: 'Discount type',
            discountPercent: 'Percentage',
            discountFixed: 'Fixed amount',
            discountValueLabel: 'Discount value',
            productsLabel: 'Included products (minimum 2)',
            searchPlaceholder: 'Search for a product...',
            noProducts: 'No approved products found',
            selectedCount: '{{count}} product(s) selected',
            startDate: 'Start date (optional)',
            endDate: 'End date (optional)',
            create: 'Create bundle',
            update: 'Update'
        },
        preview: {
            originalPrice: 'Original price',
            savings: 'Savings',
            finalPrice: 'Final price',
            minPriceWarning: 'Minimum price is €5. Reduce the discount.'
        },
        success: {
            created: 'Bundle created',
            updated: 'Bundle updated',
            deleted: 'Bundle deleted',
            activated: 'Bundle activated',
            deactivated: 'Bundle deactivated'
        },
        errors: {
            loadFailed: 'Error loading bundles',
            minProducts: 'Select at least 2 products',
            minPrice: 'Final price (€{{price}}) is below minimum €5',
            deleteFailed: 'Error deleting',
            generic: 'Error'
        }
    },

    // Modals
    modals: {
        confirm: 'Confirm',
        send: 'Send',
        minCharsLabel: 'minimum characters',
        errors: {
            fieldRequired: 'This field is required',
            minChars: 'Minimum {{count}} characters required'
        },
        withdraw: {
            title: 'Withdraw',
            subtitle: 'This action is irreversible',
            depositPaid: 'Deposit paid',
            youGet: 'You get back (25%)',
            creatorGets: 'Creator receives (20%)',
            platformFee: 'Platform fee (5%)',
            reasonLabel: 'Reason for withdrawal (optional)',
            reasonPlaceholder: 'Explain why you want to cancel...',
            confirm: 'Confirm withdrawal'
        },
        claim: {
            title: 'Report a problem',
            subtitle: 'The creator and our team will be notified',
            info: 'If the files do not work properly, describe the problem precisely. The creator can send you a corrected version.',
            describeLabel: 'Describe the problem encountered',
            describePlaceholder: "Ex: The file won't open, textures are missing, dimensions don't match...",
            errorMinChars: 'Please describe the problem in more detail (min 20 characters)',
            submit: 'Send claim'
        },
        revision: {
            title: 'Request revisions',
            subtitle: 'The creator will be notified',
            whatChanges: 'What changes do you want?',
            placeholder: 'Describe precisely the changes you would like to see...',
            errorRequired: 'Please describe the requested changes',
            submit: 'Send request'
        },
        delivery: {
            title: 'Confirm delivery?',
            message: 'You are about to deliver {{count}} file(s)',
            info: 'The client can then validate or request modifications.',
            deliver: 'Deliver'
        },
        approveDelivery: {
            title: 'Validate delivery?',
            message: 'By validating, you confirm that the work meets your expectations.',
            nextStep: 'Next step: balance payment',
            validate: 'Validate'
        },
        rejectFix: {
            title: 'Reject fix',
            version: 'Version {{version}}',
            info: 'Explain precisely what is not working so the creator can fix it effectively.',
            whatWrong: "What's wrong?",
            placeholder: "Ex: The file still won't open, colors don't match my request, still missing...",
            errorRequired: 'Please explain why the fix is not suitable',
            submit: 'Reject and send'
        },
        acceptFix: {
            title: 'Accept fix?',
            version: 'Version {{version}}',
            info: 'By accepting, the claim will be closed and the corrected files will replace the final files.',
            downloadInfo: 'You can download the corrected files once payment is complete',
            accept: 'Accept'
        }
    },

    // Report Modal
    report: {
        title: 'Report a problem',
        problemType: 'Problem type',
        descriptionLabel: 'Problem description',
        descriptionPlaceholder: 'Describe the problem in detail...',
        descriptionHint: 'The more details you provide, the faster the problem can be resolved.',
        optional: '(optional)',
        note: 'Note',
        notPurchasedInfo: 'You have not purchased this product yet. Only reports about visible elements are available.',
        infoNote: 'The seller and moderation team will be notified of your report. We will contact you if we need more information.',
        submit: 'Submit report',
        success: 'Report submitted! Staff and seller have been notified.',
        reasons: {
            copyright: 'Content theft',
            copyrightDesc: 'The product uses stolen or protected content',
            copyrightDescPost: 'The product uses stolen or protected content',
            misleading: 'Misleading description',
            misleadingDesc: 'The title or description is false',
            misleadingDescPost: 'The product does not match the description',
            inappropriate: 'Inappropriate content',
            inappropriateDesc: 'Offensive/inappropriate images or text',
            inappropriateDescPost: 'The product contains offensive content',
            bug: 'Bug / Technical error',
            bugDesc: 'The product does not work properly',
            error: 'Missing / Corrupted files',
            errorDesc: 'Files are missing or damaged',
            other: 'Other reason',
            otherDesc: 'Specify in description'
        },
        errors: {
            noReason: 'Please select a reason',
            noDescription: 'Please describe the problem',
            generic: 'Error reporting'
        }
    },

    // ModelCard
    modelCard: {
        viewShop: "View {{name}}'s shop"
    },

    // Footer
    footer: {
        description: 'The reference gaming marketplace for your 3D models, textures, plugins and more.',
        sections: {
            platform: 'Platform',
            support: 'Support',
            legal: 'Legal'
        },
        links: {
            products: 'Products',
            games: 'Games',
            becomeCreator: 'Become a creator',
            faq: 'FAQ',
            contact: 'Contact',
            help: 'Help',
            terms: 'Terms of Service',
            privacy: 'Privacy',
            cookies: 'Cookies'
        },
        allRightsReserved: 'All rights reserved.',
        madeWith: 'Made with',
        inFrance: 'in France'
    },

    // Navigation
    nav: {
        products: 'Products',
        customOrders: 'Custom orders',
        upload: 'Upload',
        notifications: 'Notifications',
        markAllRead: 'Mark all read',
        noNotifications: 'No notifications',
        view: 'View',
        markAsRead: 'Mark as read',
        delete: 'Delete',
        viewAllNotifications: 'View all notifications',
        myProfile: 'My profile',
        dashboard: 'Dashboard',
        myShop: 'My shop',
        becomeCreator: 'Become a creator',
        myPurchases: 'My purchases',
        invoices: 'Invoices',
        administration: 'Administration',
        logout: 'Log out',
        login: 'Log in',
        register: 'Sign up',
        cart: 'Cart',
        language: 'Language',
        timeAgo: {
            now: 'Just now',
            minutes: '{{count}}m ago',
            hours: '{{count}}h ago',
            days: '{{count}}d ago'
        }
    }
}