export default {
    // Common
    common: {
        free: 'Free',
        freeProduct: 'Free product',
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
        free: 'Free',
        getForFree: 'Get for free',
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
            freeOnly: 'Free only',
            showFreeOnly: 'Show free products',
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
            available: '{count} available',
            versionsSelected: '{count} version(s) selected',
            tagsSelected: '{count} tag(s) selected',
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
        results: '{count} result(s) found',
        bundles: {
            productCount: '{count} products',
            empty: {
                title: 'No bundles available',
                description: 'Sellers have not created any bundles yet'
            }
        },
        empty: {
            noFreeProducts: 'No free products available',
            title: 'No products found',
            description: 'Try modifying your search criteria',
            clearFilters: 'Clear filters'
        }
    },

    // My Products (Dashboard)
    myProducts: {
        title: 'My products',
        backToDashboard: 'Back to dashboard',
        count: '{count} product(s)',
        addProduct: 'Add a product',
        sales: '{count} sales',
        confirmDelete: 'Are you sure you want to delete "{title}"?',
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
            count: '{count} report(s)',
            active: '{count} active',
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
        count: '{count} product(s) purchased',
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
            fileTooLarge: '{name} is too large (max 50MB)',
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
            versionsSelected: '{count} version(s) selected',
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
        language:{
            title: "Language",
            subtitle: "Choose your preferred language"
        },
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
            confirmDisconnect: 'Disconnect your {provider} account?'
        },
        success: {
            updated: 'Profile updated',
            passwordChanged: 'Password changed',
            twoFAEnabled: 'Two-factor authentication enabled',
            twoFADisabled: 'Two-factor authentication disabled',
            codesCopied: 'Codes copied',
            accountDisconnected: '{provider} account disconnected',
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
            filters: 'Filters',
            game: 'Game',
            category: 'Category',
            allGames: 'All games',
            allCategories: 'All categories',
            freeOnly: 'Free',
            reset: 'Reset',
            activeFilters: 'Active filters',
            clearAll: 'Clear all',
        },
        results: {
            products: 'products',
            product: 'product',
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
                tooLarge: '{name} is too large (max 5MB)',
                tooSmall: '{name} is too small (minimum 400x400 pixels)',
                invalid: '{name} is not a valid image'
            }
        },
        info: {
            freeProduct: 'Free product',
            freeProductHint: 'Offer this product for free to users',
            freeProductEnabled: 'This product will be free',
            freeProductDescription: 'Users will be able to get it without payment',
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
                noDepFound: 'No dependency found for "{query}"',
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
                tooLarge: '{name} is too large (max 5MB)',
                tooSmall: '{name} is too small (minimum 400x400 pixels)',
                invalid: '{name} is not a valid image',
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
        downloadVersion: 'Download v{version}',
        filterByGameVersion: 'Filter by game version',
        allVersions: 'All versions',
        fileVersion: 'File version',
        selectVersion: 'Select a version',
        latest: 'Latest',
        noCompatibleVersion: 'No compatible version',
        viewAllVersions: 'View all versions',
        compatibleWith: 'Compatible with:',
        versionsAvailable: '{count} versions available',
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
        greeting: 'Hello, {username}',
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
            productsCount: '{count} products',
            invoices: 'Invoices',
            viewAll: 'View all',
            myProducts: 'My products',
            manage: 'Manage',
            settings: 'Settings',
            configure: 'Configure',
            analytics: "Analytics",
            statistics: "Statistics"
        },
        stats: {
            totalRevenue: 'Total revenue',
            totalSales: 'Total sales',
            lastSale: 'Last sale',
            lastPayout: 'Last payout',
            none: 'None',
            last30Days: "Last 30 days",
            customOrders: "Custom Orders",
            completed: "completed"
        },
        topProducts: {
            title: "Best Selling Products",
            subtitle: "Your top sellers",
            sales: "sales",
            empty: "No sales yet",
            emptyDescription: "Your best sellers will appear here"
        },
        customOrdersCta: {
            title: '{count} custom request(s) available',
            description: 'Clients are looking for your skills! Make an offer and land new orders.'
        },
        proposalsCta: {
            title: 'Propose your ideas',
            description: 'Suggest new categories, tags or versions to enrich the platform!'
        },
        stripe: {
            title: "Configure your payments",
            description: "Connect your Stripe account to receive payments automatically.",
            connect: "Connect Stripe",
            connecting: "Connecting...",
            continue: "Continue setup",
            inProgress: {
                title: "Stripe setup in progress",
                description: "Your Stripe account is not fully configured yet. Complete the setup to receive payments."
            },
            configured: {
                title: "Stripe configured ✓",
                description: "Your account is ready to receive payments."
            },
            status: {
                payments: "Payments",
                payouts: "Payouts"
            }
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

    "dashboardSettings": {
        "title": "Seller Settings",
        "subtitle": "Manage your payments and preferences",

        "toast": {
            "statusUpdated": "Status updated",
            "updateError": "Error updating status",
            "stripeConnectError": "Error connecting to Stripe",
            "dashboardError": "Error opening Stripe dashboard"
        },

        "stripe": {
            "title": "Stripe Connect",
            "subtitle": "Receive your payments automatically",
            "refreshStatus": "Refresh status",
            "connect": "Connect Stripe",
            "connecting": "Connecting...",
            "continue": "Continue",
            "dashboard": "Stripe Dashboard",
            "accountId": "Stripe account ID",

            "notConnected": {
                "title": "Account not connected",
                "description": "Connect your Stripe account to receive your sales payments directly to your bank account.",
                "feature1": "Automatic payments",
                "feature2": "Secure transfers",
                "feature3": "Quick setup"
            },

            "status": {
                "information": "Information",
                "payments": "Payments",
                "payouts": "Payouts",
                "completed": "Completed",
                "pending": "Pending",
                "enabled": "Enabled",
                "disabled": "Disabled"
            },

            "configured": {
                "title": "Account fully configured",
                "description": "You can receive payments and payouts are active."
            },

            "incomplete": {
                "title": "Configuration incomplete",
                "description": "Complete the setup to receive your payments."
            },

            "actions": {
                "viewPayments": "View my payments",
                "viewPaymentsDesc": "Transfer history",
                "bankInfo": "Bank info",
                "bankInfoDesc": "Edit my IBAN"
            }
        },

        "commission": {
            "title": "Commission",
            "subtitle": "Your commission rate on sales",
            "accountType": "Account type",
            "rate": "Commission rate",

            "types": {
                "affiliated": "Affiliated",
                "standard": "Standard"
            },

            "descriptions": {
                "hytstudio": "As a HytStudio member, you pay no commission on your sales.",
                "affiliated": "As an affiliated creator, you benefit from a preferential rate of 10%.",
                "standard": "The standard commission is 15% on each sale."
            }
        },

        "otherSettings": {
            "title": "Other settings",

            "profile": {
                "title": "My profile",
                "description": "Edit my personal information"
            },

            "store": {
                "title": "My store",
                "description": "View my public seller page"
            },

            "invoices": {
                "title": "My payment notes",
                "description": "Payment history received"
            }
        }
    },

    creatorAnalytics: {
        title: "Analytics",
        subtitle: "Detailed statistics of your sales",
        retry: "Retry",
        noData: "No data available",
        breakdown: {
            title: "Revenue breakdown",
            products: "Products",
            bundles: "Bundles",
            customOrders: "Custom orders",
            sales: "sales",
            revenue: "Revenue",
            count: "Sales",
            noSales: "No sales",
            noSalesDescription: "You haven't made any sales during this period."
        },
        filters: {
            title: "Filters",
            button: "Filters",
            clearAll: "Clear all",
            activeFilters: "Active filters",
            game: "Game",
            category: "Category",
            tags: "Tags",
            gameVersions: "Game versions",
            allGames: "All games",
            allCategories: "All categories",
            selectGameForVersions: "Select a game to see available versions",
            available: "{count} available",
            versionsSelected: "{count} version(s) selected",
            tagsSelected: "{count} tag(s) selected",
            note: "Note: Filters mainly apply to product performance. Global revenue and breakdown are not filtered."
        },
        period: {
            daysShort: "d",
            year: "1yr"
        },
        kpis: {
            revenue: "Revenue",
            sales: "Sales",
            totalViews: "Total views",
            conversion: "Conversion"
        },
        stats: {
            downloads: "Downloads",
            avgRating: "Average rating",
            uniqueBuyers: "Unique buyers",
            activeProducts: "Active products"
        },
        insights: {
            title: "Recommendations",
            revenueGrowth: {
                title: "📈 Excellent growth!",
                message: "Your revenue increased by {value}% compared to the previous period."
            },
            revenueDecline: {
                title: "⚠️ Revenue decline",
                message: "Consider promoting your products or adding new ones."
            },
            lowConversion: {
                title: "💡 Improve your conversions",
                message: "Your conversion rate is low. Try improving your descriptions and images."
            },
            excellentRating: {
                title: "⭐ Excellent ratings!",
                message: "Your average rating of {value}/5 is excellent. Keep it up!"
            },
            productsToOptimize: {
                title: "🎯 Products to optimize",
                message: "{value} product(s) have views but no sales. Review their prices or descriptions."
            }
        },
        bestHours: {
            title: "Best selling hours"
        },
        bestDays: {
            title: "Best selling days"
        },
        days: {
            sunday: "Sunday",
            monday: "Monday",
            tuesday: "Tuesday",
            wednesday: "Wednesday",
            thursday: "Thursday",
            friday: "Friday",
            saturday: "Saturday"
        },
        products: {
            title: "Performance by product",
            product: "Product",
            views: "Views",
            downloads: "Downl.",
            sales: "Sales",
            conv: "Conv.",
            revenue: "Revenue"
        },
        empty: {
            title: "No data yet",
            description: "Statistics will appear once you have sales",
            addProduct: "Add a product"
        },
        errors: {
            title: "Loading error",
            loadFailed: "Failed to load analytics"
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
        acceptModal: {
            title: 'Accept this offer?',
            message: 'You are about to accept the offer from {creator} for {price}€. Other offers will be automatically rejected.',
            confirm: 'Accept offer'
        },
        rejectModal: {
            title: 'Reject this offer?',
            message: 'Are you sure you want to reject this offer? This action cannot be undone.',
            confirm: 'Reject'
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
            button: 'Deliver ({count} file(s))',
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
            refund25: 'You get back 50% of the deposit',
            creator20: 'Creator receives 40% (work done)',
            button: 'Withdraw'
        },
        problem: {
            title: 'A problem?',
            description: 'If the files do not work properly, report it.',
            previousClaims: '{count} previous claim(s) resolved',
            button: 'Report a problem'
        },
        claim: {
            title: 'Claim in progress',
            creatorMessage: 'The client reported a problem. Please send a fix.',
            clientMessage: 'Your claim is being processed.'
        },
        fixes: {
            title: 'Fixes received ({count})',
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
            withdrawn: 'Withdrawal completed. Refund: €{amount}',
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
        acceptModal: {
            title: 'Accept this offer?',
            price: 'Total price',
            delay: 'Estimated delay',
            paymentInfo: 'You will need to pay a deposit of {amount}€ (50%) to start the order.',
            description: 'By accepting, an order will be created and you can continue discussing with the creator.',
            confirm: 'Accept offer'
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
        offersReceived: '{count} offer(s) received',
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
            minChars: '{count}/20 minimum characters',
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
        productCount: '{count} product(s)',
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
        terms: {
            accept: "I accept the",
            termsLink: "Terms of Service",
            and: "and the",
            privacyLink: "Privacy Policy",
            noRefundNotice: "By completing this purchase, I acknowledge that the immediate download of digital products results in waiving my right of withdrawal in accordance with consumer protection laws.",
            required: "Please accept the terms to continue"
        },
        errors: {
            checkoutFailed: 'Error during checkout',
            mustAcceptTerms: "You must accept the terms to continue"
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
        includedProducts: 'Included products ({count})',
        included: 'Included',
        youSave: 'You save €{amount}',
        discountApplied: 'Discount applied',
        products: 'Products',
        yourBundle: 'This is your bundle',
        bundlePurchased: 'Bundle purchased',
        viewPurchases: 'View my purchases',
        buyBundle: 'Buy bundle',
        purchaseInfo: 'By purchasing this bundle, you get all included products.',
        validUntil: 'Offer valid until {date}',
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
            commission: 'Platform commission: {percent}%',
            noCustomOrders: "No access to custom orders",
            customOrdersAccess: "Access to custom orders",
            onCustomOrders: "on custom orders"
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
            pendingDescription: 'Your application was submitted on {date}. Our team is currently reviewing it.',
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
            newTitleFor: 'New category for {game}',
            editTitle: 'Edit category',
            noneForGame: 'No categories for {game}',
            createFirst: 'Create first category',
            countForGame: '{count} category(ies) for {game}',
            namePlaceholder: 'Ex: Vehicles, Buildings...'
        },
        tags: {
            selectGame: 'Select a game to manage its tags',
            selectGameToView: 'Select a game to view its tags',
            new: 'New tag',
            newTitleFor: 'New tag for {game}',
            editTitle: 'Edit tag',
            searchPlaceholder: 'Search for a tag...',
            noFound: 'No tags found',
            noneForGame: 'No tags for {game}',
            createFirst: 'Create first tag',
            countForGame: '{count} tag(s) for {game}',
            nameLabel: 'Tag name',
            namePlaceholder: 'Ex: HD, Animated, Optimized...'
        },
        versions: {
            selectGame: 'Select a game to manage its versions',
            selectGameToView: 'Select a game to view its versions',
            new: 'New version',
            newTitleFor: 'New version for {game}',
            editTitle: 'Edit version',
            searchPlaceholder: 'Search for a version...',
            noFound: 'No versions found',
            noneForGame: 'No versions for {game}',
            createFirst: 'Create first version',
            countForGame: '{count} version(s) for {game}',
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
            noneForGame: 'No dependencies for {game}',
            create: 'Create a dependency',
            disabled: 'Disabled',
            usedBy: 'Used by {count} product(s)',
            website: 'Website',
            logoOptional: 'Logo (optional)',
            namePlaceholder: 'Ex: Fabric, Forge, OptiFine...'
        },
        confirmDelete: {
            game: 'Delete game "{name}"? This may affect associated products.',
            category: 'Delete category "{name}"?',
            tag: 'Delete tag "{name}"?',
            version: 'Delete version "{name}"?',
            dependency: 'Delete dependency "{name}"?'
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
            info: '{count} seller(s) have reached 1000+ sales and are eligible for Affiliate status (90% of revenue)'
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
            sellerResponseOn: 'Seller response ({date})',
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
        usedBy: 'Used by {count} product(s)',
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
            noRequestsWithStatus: 'No requests with status "{status}"',
            noRequestsInSystem: 'No requests in the system',
            by: 'By',
            offersCount: '{count} offer(s)',
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
            salesCount: '{count} sales',
            avgCart: 'Average cart',
            perTransaction: 'Per transaction',
            totalViews: 'Total views',
            uniqueVisitors: '{count} unique visitors',
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
            top10For: 'Top 10 for {game}'
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
            pendingReports: '{count} pending report(s)',
            reportsNeedAttention: 'Some products have been reported and need your attention',
            viewReports: 'View reports',
            pendingCustomOrders: '{count} pending custom order(s)',
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
            changesDetected: '{count} modification(s) detected',
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
            count: '{count} product(s)',
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
                description: 'You are about to hide "{title}". The seller will be notified of the reason.',
                reasonLabel: 'Reason for hiding',
                reasonPlaceholder: 'Ex: Inappropriate content, copyright, insufficient quality...'
            },
            deleteModal: {
                title: 'Delete product',
                description: 'Are you sure you want to permanently delete "{title}"? This action is irreversible.'
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
        stats: '{products} products • {sales} sales',
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
            selectedCount: '{count} product(s) selected',
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
            minPrice: 'Final price (€{price}) is below minimum €5',
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
            minChars: 'Minimum {count} characters required'
        },
        withdraw: {
            title: 'Withdraw',
            subtitle: 'This action is irreversible',
            depositPaid: 'Deposit paid',
            youGet: 'You get back (50%)',
            creatorGets: 'Creator receives (40%)',
            platformFee: 'Platform fee (10%)',
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
            message: 'You are about to deliver {count} file(s)',
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
            version: 'Version {version}',
            info: 'Explain precisely what is not working so the creator can fix it effectively.',
            whatWrong: "What's wrong?",
            placeholder: "Ex: The file still won't open, colors don't match my request, still missing...",
            errorRequired: 'Please explain why the fix is not suitable',
            submit: 'Reject and send'
        },
        acceptFix: {
            title: 'Accept fix?',
            version: 'Version {version}',
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
        viewShop: "View {name}'s shop"
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
    language: {
        title: 'Language',
        subtitle: 'Choose the interface language'
    },
    freeOnly: 'Free only',
    // Navigation
    nav: {
        products: 'Products',
        customOrders: 'Custom orders',
        upload: 'Upload',
        notifications: 'Notifications',
        markAllRead: 'Mark all read',
        noNotifications: 'No notifications',
        deleteAll: "Delete all",
        confirmDeleteAll: "Are you sure you want to delete all your notifications?",
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
            minutes: '{count}m ago',
            hours: '{count}h ago',
            days: '{count}d ago'
        }
    },
    legal: {
        lastUpdate: "Last updated",
        contact: "Contact",
        contactText: "For any questions regarding this page:",
        email: "Email",
        discord: "Discord",

        // Terms of Service
        terms: {
            title: "Terms of Service",
            preamble: {
                title: "Preamble",
                p1: "These Terms of Service (hereinafter \"Terms\") define the terms and conditions of use of the Hyt Studio platform (hereinafter \"the Platform\" or \"the Site\"), accessible at www.hytstudio.com, as well as the rights and obligations of the parties in this context.",
                p2: "Hyt Studio is a marketplace dedicated to selling digital products in the gaming universe: 3D models, textures, plugins, maps, configurations, and other digital resources for content creators and video game developers.",
                p3: "Using the Platform implies full acceptance of these Terms. If you do not accept these conditions, please do not use the Platform."
            },
            article1: {
                title: "Legal notices and identification",
                subtitle1: "Platform Publisher",
                p1: "The Hyt Studio Platform is published by [COMPANY NAME / ENTREPRENEUR], [legal form], with a capital of [AMOUNT] euros, registered in the Trade and Companies Register of [CITY] under number [RCS NUMBER], with headquarters located at [FULL ADDRESS].",
                vat: "VAT number: [VAT NUMBER]",
                emailContact: "Contact email: contact@hytstudio.com",
                director: "Publication director: [DIRECTOR NAME]",
                subtitle2: "Hosting Provider",
                p2: "The Platform is hosted by [HOSTING PROVIDER NAME], [legal form], with headquarters at [ADDRESS], reachable at [PHONE/EMAIL]."
            },
            article2: {
                title: "Definitions",
                intro: "For proper understanding of these Terms, the following terms have the meanings indicated below:",
                platform: "\"Platform\" or \"Site\"",
                platformDef: "refers to the Hyt Studio website accessible at www.hytstudio.com and its associated mobile applications.",
                user: "\"User\"",
                userDef: "refers to any natural or legal person who accesses the Platform and uses its services, whether registered or not.",
                buyer: "\"Buyer\"",
                buyerDef: "refers to any registered User who purchases one or more Products on the Platform.",
                creator: "\"Creator\" or \"Seller\"",
                creatorDef: "refers to any registered User who offers digital Products for sale on the Platform.",
                affiliated: "\"Affiliated Creator\"",
                affiliatedDef: "refers to a Creator who has obtained affiliate status with Hyt Studio, benefiting from a reduced commission of 10% on their sales.",
                nonAffiliated: "\"Non-Affiliated Creator\"",
                nonAffiliatedDef: "refers to a standard Creator subject to a 15% commission on their sales.",
                product: "\"Product\"",
                productDef: "refers to any digital content offered for sale on the Platform: 3D models, textures, plugins, maps, scripts, configurations, or any other digital file.",
                customOrder: "\"Custom Order\"",
                customOrderDef: "refers to a personalized request made by a Buyer for the creation of a specific Product by a Creator.",
                account: "\"Account\"",
                accountDef: "refers to the User's personal space on the Platform, accessible after registration."
            },
            article3: {
                title: "Access to the Platform and registration",
                subtitle1: "Access to the Platform",
                p1: "Access to the Platform is free. Browsing the Product catalog is accessible to any User without registration. However, purchasing Products and selling require creating an Account.",
                subtitle2: "Registration conditions",
                p2: "To create an Account, the User must:",
                condition1: "Be at least 18 years old or have authorization from their legal representative",
                condition2: "Provide accurate, complete, and up-to-date information (username, email address, password)",
                condition3: "Accept these Terms and the Privacy Policy",
                condition4: "Not create multiple accounts for fraudulent purposes",
                subtitle3: "Account Security",
                p3: "The User is solely responsible for the confidentiality of their login credentials. The password must meet the following security criteria:",
                password1: "At least 8 characters",
                password2: "At least one uppercase letter",
                password3: "At least one number",
                p4: "Any use of the Account is presumed to be made by the holder. In case of suspected fraudulent use, the User must immediately inform Hyt Studio at contact@hytstudio.com."
            },
            article4: {
                title: "Services offered",
                subtitle1: "For Buyers",
                p1: "The Platform allows Buyers to:",
                buyer1: "Browse and search for digital Products by game, category, or tags",
                buyer2: "Purchase Products via secure payment",
                buyer3: "Instantly download purchased Products",
                buyer4: "Access their library of purchased Products",
                buyer5: "Leave reviews and ratings on Products",
                buyer6: "Submit custom order requests",
                subtitle2: "For Creators",
                p2: "The Platform allows Creators to:",
                creator1: "Create a store and sell their digital Products",
                creator2: "Manage their Products (descriptions, prices, versions, compatibility)",
                creator3: "Access a dashboard with sales statistics",
                creator4: "Receive payments via Stripe Connect",
                creator5: "Respond to custom order requests"
            },
            article5: {
                title: "Creator status and commissions",
                subtitle1: "Becoming a Creator",
                p1: "To become a Creator on the Platform, the User must submit a request that will be reviewed by the Hyt Studio team. Acceptance is at Hyt Studio's discretion and may be refused without justification.",
                subtitle2: "Creator types and commissions",
                p2: "Hyt Studio distinguishes several Creator statuses with different commission rates:",
                nonAffiliatedTitle: "Non-Affiliated Creator:",
                nonAffiliatedDesc: "15% commission taken by Hyt Studio. The Creator keeps 85% of the sale price.",
                affiliatedTitle: "Affiliated Creator:",
                affiliatedDesc: "10% commission taken by Hyt Studio. The Creator keeps 90% of the sale price. This status is granted upon request and validation by Hyt Studio.",
                hytStudioTitle: "HytStudio:",
                hytStudioDesc: "Products created and sold directly by Hyt Studio. 100% of revenue goes to Hyt Studio.",
                subtitle3: "Creator payments",
                p3: "Payments to Creators are made automatically via Stripe Connect after each sale, minus the applicable commission. The Creator must have a valid and verified Stripe Connect account to receive payments."
            },
            article6: {
                title: "Products and content",
                subtitle1: "Creator responsibility",
                p1: "Creators are solely responsible for the Products they sell. They guarantee that they hold all necessary intellectual property rights and that their Products do not infringe on third-party rights.",
                subtitle2: "Prohibited content",
                p2: "It is strictly prohibited to sell Products:",
                forbidden1: "Containing illegal, defamatory, discriminatory, or pornographic content",
                forbidden2: "Violating third-party intellectual property rights (trademarks, copyrights, patents)",
                forbidden3: "Containing viruses, malware, or any malicious code",
                forbidden4: "Enabling cheating or violating video game terms of service",
                forbidden5: "Containing personal data of third parties without their consent",
                subtitle3: "Moderation",
                p3: "Hyt Studio reserves the right to remove any Product that does not comply with these Terms, without notice or compensation. Users can report any inappropriate content via the integrated reporting system."
            },
            article7: {
                title: "Prices and payment",
                subtitle1: "Prices",
                p1: "Product prices are displayed in euros (€) and include all applicable taxes. Creators freely set the price of their Products within any limits imposed by Hyt Studio.",
                subtitle2: "Payment methods",
                p2: "Payment is made exclusively through the secure Stripe payment platform. Accepted payment methods include credit cards (Visa, Mastercard, American Express) and other methods offered by Stripe.",
                subtitle3: "Invoicing",
                p3: "An electronic invoice is automatically generated for each purchase and made available in the Buyer's personal space. Creators also receive accounting documents summarizing their sales and commissions."
            },
            article8: {
                title: "Delivery and download",
                subtitle1: "Instant download",
                p1: "As Products are digital content, delivery is by instant download upon payment confirmation. The Buyer can access their purchases from their personal library.",
                subtitle2: "Updates",
                p2: "When a Creator updates a Product, Buyers who have already purchased that Product can download the new version at no additional cost, subject to compatibility with their game version."
            },
            article9: {
                title: "Right of withdrawal",
                important: "Important:",
                p1: "In accordance with Article L.221-28 of the Consumer Code, the right of withdrawal does not apply to contracts for the supply of digital content not provided on a tangible medium whose execution has begun with the consumer's prior express consent and express waiver of their right of withdrawal.",
                p2: "By proceeding with the purchase and download of a Product, the Buyer acknowledges having been informed and expressly accepts that:",
                point1: "Contract execution begins immediately after payment",
                point2: "They expressly waive their right of withdrawal",
                point3: "No refund can be requested after downloading the Product"
            },
            article10: {
                title: "Intellectual property",
                subtitle1: "Rights to the Platform",
                p1: "All elements of the Platform (texts, graphics, software, photographs, images, sounds, logos, trademarks) are the exclusive property of Hyt Studio or its partners and are protected by French and international intellectual property laws.",
                subtitle2: "Product usage license",
                p2: "Purchasing a Product grants the Buyer a personal, non-exclusive, and non-transferable license. Unless explicitly stated otherwise by the Creator, the Buyer is not authorized to:",
                license1: "Resell, redistribute, or share the Product",
                license2: "Modify the Product for resale",
                license3: "Use the Product for creations intended for resale without an appropriate commercial license",
                subtitle3: "Creator guarantee",
                p3: "The Creator guarantees being the exclusive holder of all intellectual property rights to the Products they sell, or having the necessary authorizations. They agree to indemnify Hyt Studio for any third-party claims regarding intellectual property infringement."
            },
            article11: {
                title: "Liability",
                subtitle1: "Intermediary role",
                p1: "Hyt Studio acts as a technical intermediary between Creators and Buyers. As such, Hyt Studio is not the seller of Products offered by third-party Creators and cannot be held responsible for the content, quality, or compliance of Products sold by them.",
                subtitle2: "Platform availability",
                p2: "Hyt Studio strives to ensure Platform availability 24/7 but does not guarantee permanent availability. Interruptions for maintenance or updates may occur. Hyt Studio cannot be held liable for damages resulting from temporary unavailability.",
                subtitle3: "Limitation of liability",
                p3: "To the extent permitted by law, Hyt Studio's liability is limited to direct and foreseeable damages. Hyt Studio cannot be held liable for indirect damages, data loss, lost profits, or commercial harm."
            },
            article12: {
                title: "Personal data protection",
                subtitle1: "Data controller",
                p1: "Hyt Studio is responsible for processing personal data collected on the Platform, in accordance with the General Data Protection Regulation (GDPR) and the French Data Protection Act.",
                subtitle2: "Data collected",
                p2: "Personal data collected may include:",
                data1: "Identification data: username, email address",
                data2: "Connection data: IP address, connection logs",
                data3: "Transaction data: purchase history, amounts",
                data4: "Payment data: handled by Stripe (Hyt Studio does not store banking data)",
                subtitle3: "User rights",
                p3: "Under GDPR, Users have the following rights:",
                right1: "Right to access their personal data",
                right2: "Right to rectify inaccurate data",
                right3: "Right to erasure (\"right to be forgotten\")",
                right4: "Right to data portability",
                right5: "Right to object to processing",
                right6: "Right to restriction of processing",
                p4: "These rights can be exercised by email at contact@hytstudio.com. For more information, see our Privacy Policy."
            },
            article13: {
                title: "Cookies",
                p1: "The Platform uses cookies to ensure proper functioning, improve user experience, and compile traffic statistics. Users can configure their browser to accept or refuse cookies. Refusing certain cookies may limit access to some features.",
                p2: "For more information on cookies used, see our Cookie Policy."
            },
            article14: {
                title: "Reporting and dispute resolution",
                subtitle1: "Reporting",
                p1: "Any User can report a Product or behavior contrary to these Terms via the Platform's integrated reporting system. Hyt Studio commits to reviewing each report within a reasonable timeframe.",
                subtitle2: "Mediation",
                p2: "In accordance with Articles L.612-1 and following of the Consumer Code, in case of dispute, the consumer may use a consumer mediator free of charge. Mediator contact details will be provided upon request.",
                subtitle3: "Customer service",
                p3: "For any complaint, the User can contact customer service by email at contact@hytstudio.com or via the contact form on the Platform."
            },
            article15: {
                title: "Suspension and termination",
                subtitle1: "Suspension by Hyt Studio",
                p1: "Hyt Studio reserves the right to suspend or terminate any Account in case of violation of these Terms, fraudulent activity, or behavior detrimental to the Platform or its Users, without notice or compensation.",
                subtitle2: "Termination by User",
                p2: "The User may request deletion of their Account at any time by sending a request to contact@hytstudio.com. Account deletion does not result in refund of purchases made or commissions already collected by Hyt Studio.",
                subtitle3: "Effects of termination",
                p3: "Upon termination, the Buyer retains access to already downloaded Products. The Creator loses access to their store but retains the right to payments due for sales made before termination."
            },
            article16: {
                title: "Modifications to terms",
                p1: "Hyt Studio reserves the right to modify these Terms at any time. Users will be informed of any substantial modification by email or notification on the Platform. Continued use of the Platform after notification of modifications constitutes acceptance of the new Terms.",
                p2: "The applicable Terms are those in effect at the date of Platform use or order placement."
            },
            article17: {
                title: "Applicable law and jurisdiction",
                p1: "These Terms are governed by French law. In case of dispute regarding the interpretation, validity, or execution of these Terms, the parties will endeavor to find an amicable solution.",
                p2: "Failing amicable agreement, any dispute will be submitted to the competent courts in accordance with applicable rules of jurisdiction.",
                p3: "In accordance with Article L.612-1 of the Consumer Code, the consumer has the option of resorting to alternative dispute resolution."
            },
            article18: {
                title: "Miscellaneous provisions",
                subtitle1: "Entirety",
                p1: "These Terms constitute the entire agreement between the User and Hyt Studio regarding use of the Platform and replace all prior agreements.",
                subtitle2: "Partial nullity",
                p2: "If any provision of these Terms is declared null or unenforceable, the other provisions will remain in effect and the null provision will be replaced by a valid provision as close as possible to the original intent.",
                subtitle3: "Non-waiver",
                p3: "Failure by Hyt Studio to exercise a right or require performance of an obligation shall not constitute a waiver of that right or obligation."
            }
        },

        // Privacy Policy
        privacy: {
            title: "Privacy Policy",
            intro: {
                p1: "At Hyt Studio, we place paramount importance on protecting your personal data. This Privacy Policy informs you about how we collect, use, store, and protect your information when you use our platform.",
                p2: "By using Hyt Studio, you accept the practices described in this policy. We invite you to read it carefully."
            },
            article1: {
                title: "Data controller",
                p1: "The data controller is:",
                company: "Hyt Studio",
                address: "[Full address]",
                p2: "For any questions regarding your personal data, you can contact us at the above address."
            },
            article2: {
                title: "Data collected",
                p1: "We collect different categories of data depending on your use of the platform:",
                identification: "Identification data",
                id1: "Username",
                id2: "Email address",
                id3: "Profile picture (optional)",
                id4: "Biography (optional)",
                technical: "Technical data",
                tech1: "IP address",
                tech2: "Browser type and version",
                tech3: "Operating system",
                tech4: "Pages visited and actions performed",
                tech5: "Date and time of connection",
                transaction: "Transaction data",
                trans1: "Purchase history",
                trans2: "Transaction amounts",
                trans3: "Products bought or sold",
                paymentNote: "Important note:",
                paymentNoteText: "Payment data (card number, etc.) is processed directly by our provider Stripe. Hyt Studio never stores your banking information."
            },
            article3: {
                title: "Purposes of processing",
                p1: "Your personal data is collected for the following purposes:",
                purpose1: "Account management:",
                purpose1Desc: "creation, authentication, profile personalization",
                purpose2: "Service provision:",
                purpose2Desc: "buying and selling products, downloads, custom orders",
                purpose3: "Payments:",
                purpose3Desc: "transaction processing, invoicing, creator payouts",
                purpose4: "Communication:",
                purpose4Desc: "notifications, service emails, customer support",
                purpose5: "Platform improvement:",
                purpose5Desc: "statistical analysis, bug detection, optimization",
                purpose6: "Security:",
                purpose6Desc: "fraud prevention, protection against unauthorized access",
                purpose7: "Legal obligations:",
                purpose7Desc: "compliance with tax and accounting regulations"
            },
            article4: {
                title: "Legal basis for processing",
                p1: "Processing of your data is based on the following legal bases:",
                legal1: "Contract performance:",
                legal1Desc: "processing necessary for providing our services (Article 6.1.b GDPR)",
                legal2: "Consent:",
                legal2Desc: "for marketing communications and certain cookies (Article 6.1.a GDPR)",
                legal3: "Legitimate interest:",
                legal3Desc: "improving our services, platform security (Article 6.1.f GDPR)",
                legal4: "Legal obligation:",
                legal4Desc: "invoice retention, tax declarations (Article 6.1.c GDPR)"
            },
            article5: {
                title: "Data recipients",
                p1: "Your data may be shared with:",
                dest1: "Our internal team:",
                dest1Desc: "only authorized personnel for service needs",
                dest2: "Stripe:",
                dest2Desc: "for payment processing",
                dest3: "Hosting provider:",
                dest3Desc: "for secure data storage",
                dest4: "Technical providers:",
                dest4Desc: "emailing services, analytics (anonymized data)",
                dest5: "Competent authorities:",
                dest5Desc: "in case of legal obligation",
                noSale: "We never sell your personal data to third parties."
            },
            article6: {
                title: "Retention period",
                p1: "We retain your data for the following periods:",
                dataType: "Data type",
                duration: "Retention period",
                account: "Account data",
                accountDuration: "Account duration + 3 years after deletion",
                transactions: "Transaction data",
                transactionsDuration: "10 years (accounting obligation)",
                invoices: "Invoices",
                invoicesDuration: "10 years (tax obligation)",
                logs: "Connection logs",
                logsDuration: "1 year",
                cookiesData: "Cookies",
                cookiesDuration: "13 months maximum"
            },
            article7: {
                title: "Your rights",
                p1: "Under GDPR, you have the following rights over your personal data:",
                access: "Right of access",
                accessDesc: "Obtain a copy of all data we hold about you.",
                rectification: "Right to rectification",
                rectificationDesc: "Correct inaccurate or incomplete data.",
                erasure: "Right to erasure",
                erasureDesc: "Request deletion of your data (\"right to be forgotten\").",
                portability: "Right to portability",
                portabilityDesc: "Retrieve your data in a structured and readable format.",
                opposition: "Right to object and restrict",
                oppositionDesc: "Object to certain processing or request its restriction.",
                exerciseRights: "To exercise these rights, contact us at contact@hytstudio.com. We will respond within one month."
            },
            article8: {
                title: "Data security",
                p1: "We implement appropriate technical and organizational measures to protect your data:",
                security1: "SSL/TLS encryption for all communications",
                security2: "Passwords hashed with secure algorithms",
                security3: "Restricted data access (principle of least privilege)",
                security4: "Regular encrypted backups",
                security5: "Intrusion monitoring and detection",
                security6: "Regular security updates"
            },
            article9: {
                title: "International transfers",
                p1: "Your data is primarily stored within the European Union. If transfer to a third country is necessary, we ensure appropriate safeguards are in place:",
                transfer1: "European Commission adequacy decision",
                transfer2: "Standard contractual clauses",
                transfer3: "Approved certification or code of conduct"
            },
            article10: {
                title: "Cookies",
                p1: "Our platform uses cookies. For more information on cookies used and how to manage them, see our Cookie Policy."
            },
            article11: {
                title: "Minors",
                p1: "Hyt Studio is intended for persons aged 18 and over. We do not knowingly collect personal data from minors. If you are a parent or guardian and believe your child has provided us with personal data, please contact us."
            },
            article12: {
                title: "Changes to this policy",
                p1: "We may update this Privacy Policy. In case of substantial changes, we will inform you by email or notification on the platform. The last update date is shown at the top of this page."
            },
            article13: {
                title: "Complaint",
                p1: "If you believe the processing of your personal data constitutes a GDPR violation, you have the right to lodge a complaint with the supervisory authority:",
                cnil: "CNIL (French Data Protection Authority)",
                cnilAddress: "3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, France"
            }
        },

        // Cookies
        cookies: {
            title: "Cookie Policy",
            whatIs: {
                title: "What is a cookie?",
                p1: "A cookie is a small text file placed on your device (computer, smartphone, tablet) when visiting a website. It allows the site to remember information about your visit, such as your preferred language or login credentials.",
                p2: "Cookies can be \"first-party\" (placed by Hyt Studio) or \"third-party\" (placed by our partners). They can be \"session\" cookies (deleted when browser closes) or \"persistent\" (kept for a defined period)."
            },
            why: {
                title: "Why do we use cookies?",
                p1: "Hyt Studio uses cookies to:",
                reason1: "Ensure functioning",
                reason1Desc: "of the site (authentication, cart, security)",
                reason2: "Remember your preferences",
                reason2Desc: "(theme, language, settings)",
                reason3: "Analyze usage",
                reason3Desc: "of the site to improve it",
                reason4: "Measure effectiveness",
                reason4Desc: "of our communications"
            },
            types: {
                title: "Types of cookies used",
                necessary: {
                    name: "Essential cookies",
                    description: "These cookies are essential for site operation. They enable navigation, authentication, and security.",
                    required: "Always active"
                },
                functional: {
                    name: "Functional cookies",
                    description: "These cookies improve your experience by remembering your preferences (language, theme, etc.)."
                },
                analytics: {
                    name: "Analytics cookies",
                    description: "These cookies help us understand how visitors use the site to improve our services."
                },
                marketing: {
                    name: "Marketing cookies",
                    description: "These cookies are used to show you relevant ads and measure campaign effectiveness."
                },
                cookieName: "Name",
                cookiePurpose: "Purpose",
                cookieDuration: "Duration"
            },
            manage: {
                title: "How to manage your cookies?",
                platform: "Via our platform",
                platformDesc: "You can change your preferences at any time using the buttons above or by clicking the \"Manage cookies\" link at the bottom of each page.",
                browser: "Via your browser",
                browserDesc: "You can also configure your browser to accept or refuse cookies. Here are links to instructions for major browsers:",
                warning: "Warning:",
                warningText: "Disabling certain cookies may affect site functionality. For example, without authentication cookies, you cannot stay logged in."
            },
            thirdParty: {
                title: "Third-party cookies",
                p1: "Some third-party services may place cookies on your device:",
                stripe: "For secure payment processing.",
                analytics: "For audience analysis."
            },
            updates: {
                title: "Updates to this policy",
                p1: "We may update this policy to reflect changes in our cookie usage. The last update date is shown at the top of this page. We encourage you to check this page regularly."
            },
            learnMore: {
                title: "Learn more",
                p1: "For more information on cookies and your rights:",
                cnilLink: "CNIL - Cookies and trackers",
                privacyLink: "Our Privacy Policy",
                termsLink: "Our Terms of Service"
            },
            buttons: {
                acceptAll: "Accept all",
                rejectAll: "Reject all (except essential)"
            }
        }
    },
    // ============ CONTACT ============
    contact: {
        title: "Contact Us",
        subtitle: "Have a question, suggestion, or need help? Don't hesitate to reach out.",
        backToHome: "Back to home",

        form: {
            name: "Name",
            namePlaceholder: "Your name",
            email: "Email",
            emailPlaceholder: "your@email.com",
            subject: "Subject",
            subjectPlaceholder: "What is it about?",
            message: "Message",
            messagePlaceholder: "Describe your request in detail...",
            send: "Send message",
            sending: "Sending..."
        },

        info: {
            email: "Email",
            discordDesc: "Join our community to get help quickly.",
            joinDiscord: "Join Discord",
            responseTime: "Response time",
            responseTimeDesc: "We typically respond within 24 to 48 business hours.",
            needHelp: "Need quick help?",
            needHelpDesc: "Check our FAQ to find instant answers.",
            viewFaq: "View FAQ"
        },

        success: "Message sent successfully!",
        errors: {
            requiredFields: "Please fill in all required fields",
            sendFailed: "Error sending message"
        }
    },

    // ============ HELP / FAQ ============
    help: {
        title: "Help Center",
        subtitle: "Quickly find answers to your most frequently asked questions.",
        backToHome: "Back to home",
        searchPlaceholder: "Search for a question...",
        noResults: "No results found for your search",

        categories: {
            all: "All",
            account: "Account",
            purchase: "Purchases",
            download: "Download",
            creator: "Creator",
            payment: "Payment"
        },

        faq: {
            title: "Frequently Asked Questions",
            subtitle: "Quickly find answers to all your questions about HytModel",
            backToHome: "Back to home",
            searchPlaceholder: "Search for a question...",
            resultsCount: "{count} result(s) found",
            noResults: "No results found",
            noResultsHint: "Try other keywords or contact us",

            categories: {
                all: "All",
                general: "General",
                account: "Account",
                purchase: "Purchases",
                download: "Download",
                creator: "Creators",
                custom: "Custom Orders",
                bundle: "Bundles",
                payment: "Payments",
                legal: "Legal"
            },

            needHelp: {
                title: "Didn't find your answer?",
                description: "Our team is here to help. Don't hesitate to contact us directly.",
                contactUs: "Contact us",
                joinDiscord: "Join Discord"
            },

            questions: {
                // ============ GENERAL ============
                general: {
                    whatIs: {
                        q: "What is HytModel?",
                        a: "HytModel is a marketplace specializing in the sale of 3D models, textures, assets, and resources primarily for Minecraft and Hytale. Our platform connects talented creators with developers, server creators, and enthusiasts looking for quality content for their projects."
                    },
                    productTypes: {
                        q: "What types of products can be found on HytModel?",
                        a: "You will find on HytModel:\n\n• 3D models (characters, mobs, items, blocks, vehicles, buildings...)\n• Textures and resource packs\n• Maps and environments\n• Animations\n• Plugins and scripts\n• Thematic bundles\n\nMost of our assets are optimized for Minecraft and Hytale, but we also accept creations for other platforms."
                    },
                    whichGames: {
                        q: "Which games are the assets designed for?",
                        a: "HytModel primarily specializes in assets for:\n\n• Minecraft (Java & Bedrock)\n• Hytale\n\nHowever, we also accept creations for other games and platforms. Each product clearly indicates which game or platform it is optimized for."
                    },
                    languages: {
                        q: "Is the site available in multiple languages?",
                        a: "Yes, HytModel is available in French and English. You can change the language at any time via the language selector in the menu."
                    }
                },

                // ============ ACCOUNT ============
                account: {
                    create: {
                        q: "How do I create an account?",
                        a: "To create an account:\n\n1. Click 'Login' at the top right\n2. Click 'Create an account'\n3. Fill out the form (email, password)\n4. Validate your email via the link sent\n\nYou can also sign up directly with your Discord account for faster registration."
                    },
                    forgotPassword: {
                        q: "I forgot my password, what should I do?",
                        a: "Don't panic! On the login page, click 'Forgot password'. Enter the email address associated with your account and you will receive a reset link valid for 24 hours."
                    },
                    modifyInfo: {
                        q: "How do I change my personal information?",
                        a: "Log in to your account, then access your profile via the user menu. You can modify:\n\n• Your display name\n• Your avatar\n• Your biography\n• Your social links\n• Your email address\n• Your password"
                    },
                    delete: {
                        q: "How do I delete my account?",
                        a: "To delete your account, contact our team via the Contact page specifying your deletion request.\n\n⚠️ Warning: This action is irreversible. You will permanently lose access to all your purchases and, if you are a creator, your products will be removed from sale."
                    },
                    suspended: {
                        q: "My account has been suspended, why?",
                        a: "An account can be suspended for several reasons:\n\n• Violation of terms of use\n• Suspicious activity detected\n• Unresolved payment dispute\n• Multiple reports\n\nIf you believe this is an error, contact our support with the details of your situation."
                    }
                },

                // ============ PURCHASES ============
                purchase: {
                    howToBuy: {
                        q: "How do I buy a product?",
                        a: "Buying on HytModel is simple:\n\n1. Browse the catalog or use the search\n2. Click on a product to see the details\n3. Click 'Add to cart'\n4. Go to your cart and validate\n5. Accept the Terms of Service and proceed to payment\n6. The download starts automatically!"
                    },
                    paymentMethods: {
                        q: "What payment methods do you accept?",
                        a: "We accept the following payment methods via Stripe:\n\n• Credit cards (Visa, Mastercard, American Express)\n• Apple Pay\n• Google Pay\n\nAll payments are 100% secure and encrypted."
                    },
                    paymentFailed: {
                        q: "My payment was declined, what should I do?",
                        a: "If your payment is declined:\n\n1. Check that the card information is correct\n2. Make sure your card is not expired\n3. Check that you have sufficient funds\n4. Contact your bank (sometimes online purchases are blocked)\n5. Try another card or payment method\n\nIf the problem persists, contact our support."
                    },
                    invoice: {
                        q: "Can I get an invoice?",
                        a: "Yes! All your invoices are automatically generated and available in your 'My purchases' area. You can download them in PDF format at any time. Invoices contain all required legal information."
                    },
                    promoCode: {
                        q: "How do I use a promo code?",
                        a: "During checkout, you will see a 'Promo code' field before finalizing your order. Enter your code and click 'Apply'. The discount will be immediately visible on the total amount."
                    }
                },

                // ============ DOWNLOAD ============
                download: {
                    howTo: {
                        q: "How do I download my purchases?",
                        a: "After a successful purchase:\n\n1. You are redirected to a confirmation page\n2. The download starts automatically\n3. If not, click the download button\n\nYou can also find all your purchases in 'My purchases' in your user area."
                    },
                    limit: {
                        q: "How many times can I download a product?",
                        a: "There is no limit! Once purchased, you can download your product as many times as you want, with no time limit. Your purchases remain accessible for life in your library."
                    },
                    formats: {
                        q: "What formats are the files in?",
                        a: "Files are usually provided in .zip archive containing:\n\n• 3D models: FBX, OBJ, GLTF, Blend\n• Textures: PNG, JPG, TGA\n• Documentation: PDF, TXT\n\nThe exact format is indicated on each product page. Check compatibility with your software before purchasing."
                    },
                    notWorking: {
                        q: "The download is not working, what should I do?",
                        a: "If you experience download problems:\n\n1. Check your internet connection\n2. Temporarily disable your ad blocker\n3. Try another browser\n4. Clear your browser cache\n5. Make sure you are logged into the correct account\n\nIf the problem persists, contact our support with error details."
                    },
                    corrupted: {
                        q: "The downloaded file is corrupted or incomplete",
                        a: "If your file seems damaged:\n\n1. Try downloading it again\n2. Use another decompression software (7-Zip, WinRAR)\n3. Check that you have enough disk space\n\nIf the problem persists after several attempts, contact support specifying the product concerned."
                    }
                },

                // ============ CREATORS ============
                creator: {
                    becomeSeller: {
                        q: "How do I become a seller on HytModel?",
                        a: "To become a seller:\n\n1. Log in to your account\n2. Click 'Become a creator' in the menu\n3. Fill out the application form\n4. Attach your portfolio and links\n5. Wait for validation from our team (within a few days)\n\nWe review each application to ensure the quality of our catalog."
                    },
                    commissions: {
                        q: "What are the commissions charged?",
                        a: "Our commissions are among the lowest in the market:\n\n• Non-affiliated seller: 85% for you (15% commission)\n• Affiliated seller: 90% for you (10% commission)\n• HytStudio: 100% for the platform\n\nAffiliated status is granted to quality creators after evaluation of their sales and product quality."
                    },
                    uploadProduct: {
                        q: "How do I list a product for sale?",
                        a: "Once your creator account is validated:\n\n1. Access your Dashboard\n2. Click 'Add a product'\n3. Fill in the information (title, description, price...)\n4. Upload your files and images\n5. Submit for validation\n\nOur team verifies each product before publication to ensure quality."
                    },
                    whenPaid: {
                        q: "When and how do I get paid?",
                        a: "Payments work via Stripe Connect:\n\n1. Set up your Stripe account from the Dashboard\n2. After each sale, your share is transferred to Stripe\n3. Stripe deposits funds to your bank account\n\nTransfer times depend on your Stripe configuration (usually 2-7 business days)."
                    },
                    becomeAffiliated: {
                        q: "How do I become Affiliated?",
                        a: "Affiliated status is granted by our team based on several criteria:\n\n• Consistent quality of your products\n• Regular sales volume\n• Good reputation (ratings, reviews)\n• Compliance with guidelines\n\nYou cannot request this status directly; it will be offered automatically when you meet the criteria."
                    },
                    aiProducts: {
                        q: "Can I sell products created with AI?",
                        a: "Products generated entirely by AI are not accepted on HytModel. However, using AI tools as assistance in your creative workflow is tolerated, provided that the final work is significantly modified and improved by you."
                    }
                },

                // ============ CUSTOM ORDERS ============
                custom: {
                    whatIs: {
                        q: "What is a custom order?",
                        a: "A custom order allows you to request the creation of a personalized asset according to your specific needs. You describe your project, set a budget, and affiliated creators make proposals to you."
                    },
                    howToOrder: {
                        q: "How do I place a custom order?",
                        a: "To place a custom order:\n\n1. Log in to your account\n2. Go to the 'Custom Orders' section\n3. Click 'New request'\n4. Describe your project in detail\n5. Indicate your budget and desired deadline\n6. Wait for proposals from creators"
                    },
                    whoCanRespond: {
                        q: "Who can respond to my requests?",
                        a: "Only Affiliated and HytStudio creators can respond to custom requests. These are verified creators whose work quality has been validated by our team."
                    },
                    payment: {
                        q: "How does payment for custom orders work?",
                        a: "Payment is made in two stages:\n\n1. 50% deposit upon acceptance of the offer\n2. 50% balance upon delivery and validation of the work\n\nThis system protects both the client and the creator."
                    },
                    commission: {
                        q: "What is the commission on custom orders?",
                        a: "The HytModel commission on custom orders is only 5% for Affiliated creators (they keep 95%). HytStudio creators keep 100% of the amount."
                    },
                    notSatisfied: {
                        q: "What if I'm not satisfied with the result?",
                        a: "Before validating the final delivery, you can request modifications within the limits of what was agreed. In case of dispute, contact our support team who will arbitrate the situation fairly."
                    }
                },

                // ============ BUNDLES ============
                bundle: {
                    whatIs: {
                        q: "What is a bundle?",
                        a: "A bundle is a grouped offer combining several products from the same creator at a reduced price. It's an excellent way to get multiple complementary assets while saving money."
                    },
                    worthIt: {
                        q: "Are bundles really worth it?",
                        a: "Yes! Bundles typically offer between 15% and 50% discount compared to buying products separately. The savings percentage is clearly displayed on each bundle."
                    },
                    alreadyOwn: {
                        q: "I already purchased a product from the bundle, can I get a discount?",
                        a: "Unfortunately, bundles are sold as-is and do not take into account previous purchases. We recommend checking the content before purchasing if you already own some products."
                    },
                    createBundle: {
                        q: "How do I create a bundle as a seller?",
                        a: "In your creator Dashboard:\n\n1. Go to the 'Bundles' section\n2. Click 'Create a bundle'\n3. Select at least 2 of your products\n4. Set the discount (% or fixed amount)\n5. The final price must be at least €5"
                    }
                },

                // ============ PAYMENTS ============
                payment: {
                    secure: {
                        q: "Are payments secure?",
                        a: "Absolutely! All payments are processed by Stripe, the world leader in online payments. Your banking data never passes through our servers and is protected by bank-level encryption (SSL/TLS)."
                    },
                    stripeConnect: {
                        q: "How do I set up Stripe Connect (sellers)?",
                        a: "To receive your payments:\n\n1. Access your creator Dashboard\n2. Click on the 'Set up Stripe' banner\n3. Follow the Stripe verification steps\n4. Once validated, you will receive your payments automatically\n\nStripe may request identity documents to verify your account."
                    },
                    currency: {
                        q: "What currency are prices in?",
                        a: "All prices on HytModel are displayed in Euros (€). Payment is converted to your local currency by your bank if necessary."
                    },
                    installments: {
                        q: "Can I pay in installments?",
                        a: "Installment payment is not currently available. Purchases must be paid in full at the time of order."
                    }
                },

                // ============ LEGAL ============
                legal: {
                    refund: {
                        q: "Can I get a refund?",
                        a: "In accordance with Article L.221-28 of the Consumer Code, digital products are not refundable once the download has been made.\n\nBy purchasing on HytModel, you agree to waive your right of withdrawal to benefit from immediate download.\n\nIn case of a proven technical problem with a file, contact our support."
                    },
                    license: {
                        q: "What license applies to purchased products?",
                        a: "Each product is sold with a personal and commercial use license (unless otherwise stated). You can:\n\n✓ Use the product in your personal projects\n✓ Use the product in your commercial projects\n✓ Modify the product to suit your needs\n\nYou cannot:\n✗ Resell the product as-is\n✗ Redistribute the source files\n✗ Share your purchase with others"
                    },
                    gdpr: {
                        q: "How is my personal data protected?",
                        a: "Your data is processed in accordance with GDPR. We only collect information necessary for the operation of the service. You can consult our Privacy Policy for more details and exercise your rights (access, rectification, deletion) by contacting us."
                    },
                    whereLegal: {
                        q: "Where can I find the Terms of Service and legal notices?",
                        a: "All our legal pages are accessible from the footer of the site:\n\n• Terms of Service\n• Privacy Policy\n• Cookie Policy\n• Legal Notice"
                    },
                    dispute: {
                        q: "What should I do in case of a dispute?",
                        a: "In case of dispute, we favor amicable resolution. Contact our support detailing your situation. If no solution is found, you can resort to a consumer mediator in accordance with Articles L.616-1 and R.616-1 of the Consumer Code."
                    }
                }
            }
        },

        stillNeedHelp: {
            title: "Didn't find your answer?",
            description: "Our team is here to help. Don't hesitate to contact us.",
            contactUs: "Contact us",
            joinDiscord: "Join Discord"
        }
    }
}