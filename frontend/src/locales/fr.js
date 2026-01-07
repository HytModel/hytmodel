export default {
    // Commun
    common: {
        loading: 'Chargement...',
        cancel: 'Annuler',
        close: 'Fermer',
        back: 'Retour',
        add: 'Ajouter',
        edit: 'Modifier',
        delete: 'Supprimer',
        update: 'Mettre à jour',
        all: 'Tout',
        none: 'Aucun',
        error: 'Erreur',
        by: 'par',
        optional: 'optionnel'
    },

    // Home Page
    home: {
        hero: {
            badge: 'La marketplace gaming de référence',
            title: 'Trouvez le produit',
            titleHighlight: 'parfait pour votre projet',
            description: 'Des milliers de ressources premium créées par des artistes talentueux. Modèles 3D, textures, plugins, maps et plus encore.',
            exploreButton: 'Explorer les produits',
            creatorButton: 'Devenir créateur'
        },
        stats: {
            products: 'Produits',
            creators: 'Créateurs',
            sales: 'Ventes',
            rating: 'Note moyenne'
        },
        games: {
            title: 'Nos univers de jeux',
            subtitle: 'Explorez les produits par jeu',
            viewAll: 'Voir tous les produits',
            explore: 'Explorer les produits'
        },
        popular: {
            title: 'Produits populaires',
            subtitle: 'Découvrez les créations les plus appréciées',
            viewAll: 'Voir tout',
            empty: 'Aucun produit disponible pour le moment'
        },
        whyUs: {
            title: 'Pourquoi choisir HytModel ?',
            subtitle: 'Une plateforme pensée pour les créateurs et les acheteurs'
        },
        features: {
            quality: {
                title: 'Qualité vérifiée',
                description: 'Chaque produit est vérifié par notre équipe avant publication.'
            },
            instant: {
                title: 'Téléchargement instantané',
                description: 'Accédez à vos achats immédiatement après paiement.'
            },
            community: {
                title: 'Communauté active',
                description: "Rejoignez des milliers de créateurs et acheteurs."
            },
            revenue: {
                title: 'Revenus justes',
                description: "Les créateurs gardent jusqu'à 90% des ventes."
            }
        },
        cta: {
            title: 'Prêt à commencer ?',
            description: "Rejoignez notre communauté de créateurs et d'acheteurs dès aujourd'hui.",
            registerButton: 'Créer un compte gratuit',
            exploreButton: 'Explorer sans compte'
        }
    },

    // Invoices
    invoices: {
        title: 'Mes Factures',
        subtitle: 'Consultez et téléchargez vos factures',
        invoiceNumber: 'Facture',
        downloadPdf: 'Télécharger PDF',
        stats: {
            purchaseInvoices: "Factures d'achat",
            paymentNotes: 'Notes de paiement'
        },
        tabs: {
            purchases: 'Mes achats',
            sales: 'Mes ventes'
        },
        empty: {
            title: 'Aucune facture',
            noPurchases: "Vous n'avez pas encore de factures d'achat",
            noSales: "Vous n'avez pas encore de notes de paiement"
        },
        success: {
            downloaded: 'Facture téléchargée'
        },
        errors: {
            loadFailed: 'Erreur lors du chargement des factures',
            downloadFailed: 'Erreur lors du téléchargement'
        }
    },

    // Login
    login: {
        title: 'Connexion',
        subtitle: 'Connectez-vous à votre compte',
        email: 'Email',
        emailPlaceholder: 'vous@exemple.com',
        password: 'Mot de passe',
        submit: 'Se connecter',
        noAccount: 'Pas encore de compte ?',
        createAccount: 'Créer un compte',
        orContinueWith: 'Ou continuer avec',
        twoFA: {
            title: 'Vérification 2FA',
            subtitle: "Entrez le code de votre application d'authentification",
            codeLabel: "Code d'authentification",
            codeHint: 'Entrez le code à 6 chiffres de votre app (Google Authenticator, Authy, etc.)',
            verify: 'Vérifier',
            backupCodeHint: 'Vous pouvez aussi utiliser un code de secours'
        },
        errors: {
            fillAllFields: 'Veuillez remplir tous les champs',
            enter2FACode: "Veuillez entrer votre code d'authentification",
            loginFailed: 'Erreur de connexion'
        }
    },

    // Model Detail
    modelDetail: {
        backToProducts: 'Retour aux produits',
        description: 'Description',
        tags: 'Tags',
        compatibleVersions: 'Versions du jeu compatibles',
        price: 'Prix',
        addToCart: 'Ajouter au panier',
        inCart: 'Dans le panier',
        editProduct: 'Modifier mon produit',
        report: 'Signaler',
        creator: 'Créateur',
        youtube: {
            title: 'Vidéo de présentation'
        },
        stats: {
            reviews: 'avis',
            views: 'Vues',
            downloads: 'Téléchargements'
        },
        dependencies: {
            title: 'Dépendances',
            requiredFor: 'Requis pour le fonctionnement',
            recommended: 'Recommandé',
            siteProduct: 'Produit du site',
            inCart: 'Dans le panier',
            version: 'Version',
            officialSite: 'Site officiel',
            view: 'Voir'
        },
        download: {
            button: 'Télécharger',
            availableVersions: 'Versions disponibles',
            latest: 'Dernière',
            filterByGameVersion: 'Filtrer par version du jeu',
            allVersions: 'Toutes les versions',
            compatibleWith: 'Compatible avec',
            success: 'Téléchargement démarré',
            errors: {
                selectVersion: 'Sélectionnez une version',
                failed: 'Erreur de téléchargement'
            }
        },
        share: {
            button: 'Partager',
            success: 'Lien copié !'
        },
        rating: {
            title: 'Noter ce produit',
            success: 'Note enregistrée',
            error: 'Erreur lors de la notation'
        },
        errors: {
            notFound: 'Produit non trouvé'
        }
    },

    // Models / Shop
    models: {
        title: 'Boutique',
        subtitle: 'Découvrez nos produits et offres groupées',
        searchPlaceholder: 'Rechercher...',
        tabs: {
            products: 'Produits',
            bundles: 'Bundles'
        },
        filters: {
            button: 'Filtres',
            title: 'Filtres avancés',
            clearAll: 'Effacer tout',
            activeFilters: 'Filtres actifs',
            game: 'Jeu',
            allGames: 'Tous les jeux',
            category: 'Catégorie',
            allCategories: 'Toutes les catégories',
            minPrice: 'Prix min (€)',
            maxPrice: 'Prix max (€)',
            gameVersions: 'Versions du jeu',
            tags: 'Tags',
            available: '{{count}} disponible(s)',
            versionsSelected: '{{count}} version(s) sélectionnée(s)',
            tagsSelected: '{{count}} tag(s) sélectionné(s)',
            selectGameForVersions: 'Sélectionnez un jeu pour filtrer par version',
            sortBy: 'Trier par',
            sort: {
                newest: 'Plus récents',
                popular: 'Plus populaires',
                rating: 'Mieux notés',
                priceAsc: 'Prix croissant',
                priceDesc: 'Prix décroissant'
            }
        },
        results: '{{count}} résultat(s) trouvé(s)',
        bundles: {
            productCount: '{{count}} produits',
            empty: {
                title: 'Aucun bundle disponible',
                description: "Les vendeurs n'ont pas encore créé d'offres groupées"
            }
        },
        empty: {
            title: 'Aucun produit trouvé',
            description: 'Essayez de modifier vos critères de recherche',
            clearFilters: 'Effacer les filtres'
        }
    },

    // My Products (Dashboard)
    myProducts: {
        title: 'Mes produits',
        backToDashboard: 'Retour au dashboard',
        count: '{{count}} produit(s)',
        addProduct: 'Ajouter un produit',
        sales: '{{count}} ventes',
        confirmDelete: 'Êtes-vous sûr de vouloir supprimer "{{title}}" ?',
        stats: {
            total: 'Total',
            online: 'En ligne',
            pending: 'En attente',
            hidden: 'Masqués'
        },
        status: {
            online: 'En ligne',
            pending: 'En attente',
            rejected: 'Rejeté',
            hidden: 'Masqué'
        },
        empty: {
            title: 'Aucun produit',
            description: "Vous n'avez pas encore ajouté de produits.",
            addFirst: 'Ajouter mon premier produit'
        },
        messages: {
            hiddenByTeam: "Produit masqué par l'équipe",
            reason: 'Raison',
            rejected: 'Produit rejeté',
            rejectedDescription: "Ce produit n'a pas été approuvé par l'équipe de modération.",
            pendingValidation: "En attente de validation par l'équipe."
        },
        actions: {
            view: 'Voir',
            edit: 'Modifier',
            delete: 'Supprimer'
        },
        reports: {
            count: '{{count}} signalement(s)',
            active: '{{count}} en cours',
            noDescription: 'Aucune description',
            staffNote: 'Note du staff',
            yourResponse: 'Votre réponse',
            sentOn: 'Envoyée le',
            respond: 'Répondre',
            reasons: {
                bug: 'Bug technique',
                error: 'Fichiers manquants',
                misleading: 'Description trompeuse',
                copyright: 'Violation de droits',
                inappropriate: 'Contenu inapproprié',
                other: 'Autre'
            },
            status: {
                pending: 'En attente de vérification',
                reviewed: "En cours d'examen",
                resolved: 'Résolu',
                dismissed: 'Rejeté (non fondé)'
            },
            modal: {
                title: 'Répondre au signalement',
                responseLabel: 'Votre réponse / argumentation',
                responsePlaceholder: "Expliquez pourquoi ce signalement n'est pas fondé, ou les actions que vous avez prises pour corriger le problème...",
                responseHint: 'Cette réponse sera visible par l\'équipe de modération.',
                send: 'Envoyer',
                success: 'Réponse envoyée',
                errors: {
                    emptyResponse: 'Veuillez entrer une réponse',
                    sendFailed: "Erreur lors de l'envoi"
                }
            }
        },
        success: {
            deleted: 'Produit supprimé'
        },
        errors: {
            loadFailed: 'Erreur lors du chargement des produits',
            deleteFailed: 'Erreur lors de la suppression'
        }
    },

    // My Purchases
    myPurchases: {
        title: 'Mes achats',
        count: '{{count}} produit(s) acheté(s)',
        download: 'Télécharger',
        viewProduct: 'Voir le produit',
        empty: {
            title: 'Aucun achat',
            description: "Vous n'avez pas encore effectué d'achat",
            discoverProducts: 'Découvrir les produits'
        },
        invoices: {
            title: 'Factures',
            description: "Vos factures sont envoyées par email après chaque achat. Contactez le support si vous avez besoin d'une copie."
        },
        success: {
            downloadStarted: 'Téléchargement démarré'
        },
        errors: {
            loadFailed: 'Erreur lors du chargement des achats',
            downloadFailed: 'Erreur lors du téléchargement'
        }
    },

    // New Custom Request
    newCustomRequest: {
        title: 'Nouvelle demande sur mesure',
        subtitle: 'Décrivez votre projet pour recevoir des offres de nos créateurs',
        success: 'Demande envoyée ! Elle sera examinée par notre équipe.',
        info: {
            title: 'À savoir',
            point1: 'Votre demande sera examinée par notre équipe avant publication',
            point2: 'Les créateurs affiliés pourront ensuite vous faire des offres',
            point3: "Paiement en 2 fois : 50% à l'acceptation, 50% à la livraison",
            point4: "En cas d'annulation, seuls 50% de l'acompte sont remboursés"
        },
        form: {
            titleLabel: 'Titre de votre demande',
            titlePlaceholder: 'Ex: Interface de menu FiveM moderne',
            descriptionLabel: 'Description détaillée',
            descriptionPlaceholder: 'Décrivez en détail ce que vous souhaitez : fonctionnalités, style visuel, références, etc.',
            minCharacters: 'caractères minimum',
            budgetSection: 'Budget et délai',
            budgetMin: 'Budget minimum (€)',
            budgetMax: 'Budget maximum (€)',
            deadline: 'Date limite souhaitée',
            categorySection: 'Catégorie',
            game: 'Jeu concerné',
            selectGame: 'Sélectionner un jeu',
            productType: 'Type de produit',
            selectCategory: 'Sélectionner une catégorie',
            attachments: 'Pièces jointes',
            attachmentsHint: 'Ajoutez des images de référence, maquettes, ou tout document utile (max 5 fichiers, 50MB chacun)',
            uploadHint: 'Cliquez ou glissez des fichiers ici',
            submit: 'Envoyer ma demande'
        },
        errors: {
            fileTooLarge: '{{name}} est trop volumineux (max 50MB)',
            maxFiles: 'Maximum 5 fichiers autorisés',
            titleDescriptionRequired: 'Titre et description requis',
            descriptionMinLength: 'La description doit faire au moins 50 caractères',
            createFailed: 'Erreur lors de la création'
        }
    },

    // Not Found (404)
    notFound: {
        title: 'Page introuvable',
        description: 'Oups ! La page que vous recherchez semble avoir disparu dans une autre dimension.',
        backHome: "Retour à l'accueil",
        exploreModels: 'Explorer les modèles',
        goBack: 'Revenir en arrière'
    },

    // OAuth Callback
    oauthCallback: {
        loading: 'Connexion en cours...',
        success: 'Connexion réussie !',
        error: 'Erreur lors de la connexion'
    },

    // Product Versions Manager
    productVersions: {
        title: 'Versions du fichier',
        newVersion: 'Nouvelle version',
        main: 'Principale',
        downloads: 'téléchargements',
        releaseNotes: 'Notes de version',
        compatibleVersions: 'Versions du jeu compatibles',
        setAsMain: 'Définir comme principale',
        confirmDelete: 'Supprimer cette version ? Cette action est irréversible.',
        empty: {
            title: 'Aucune version',
            description: 'Ajoutez la première version de votre fichier',
            addFirst: 'Ajouter une version'
        },
        modal: {
            createTitle: 'Nouvelle version',
            editTitle: 'Modifier la version',
            versionNumber: 'Numéro de version',
            versionPlaceholder: 'Ex: 1.0.0, 2.1.3, v3.0...',
            file: 'Fichier',
            clickToSelect: 'Cliquez pour sélectionner un fichier',
            fileFormats: 'ZIP, RAR, 7Z, TAR, GZ (max 500MB)',
            compatibleVersions: 'Versions du jeu compatibles',
            noGameVersions: 'Aucune version de jeu disponible',
            versionsSelected: '{{count}} version(s) sélectionnée(s)',
            changelog: 'Notes de version (changelog)',
            changelogPlaceholder: 'Décrivez les changements de cette version...',
            mainVersion: 'Version principale',
            mainVersionHint: 'Cette version sera téléchargée par défaut',
            errors: {
                versionRequired: 'Numéro de version requis',
                fileRequired: 'Fichier requis'
            }
        },
        success: {
            added: 'Version ajoutée',
            updated: 'Version mise à jour',
            deleted: 'Version supprimée',
            setMain: 'Version définie comme principale'
        }
    },

    // Profile
    profile: {
        title: 'Mon Profil',
        save: 'Sauvegarder',
        tabs: {
            profile: 'Profil',
            security: 'Sécurité',
            connections: 'Connexions'
        },
        avatar: {
            title: 'Photo de profil',
            hint: 'JPG, PNG ou GIF. Max 2 MB.'
        },
        info: {
            title: 'Informations',
            displayName: "Nom d'affichage",
            bio: 'Bio',
            bioPlaceholder: 'Parlez de vous...',
            website: 'Site web'
        },
        social: {
            title: 'Réseaux sociaux',
            discordPlaceholder: 'username#0000 ou ID serveur',
            youtubePlaceholder: 'URL de votre chaîne'
        },
        password: {
            title: 'Mot de passe',
            subtitle: 'Modifier votre mot de passe',
            current: 'Mot de passe actuel',
            new: 'Nouveau mot de passe',
            confirm: 'Confirmer',
            change: 'Changer le mot de passe'
        },
        twoFA: {
            title: 'Double authentification (2FA)',
            enabled: 'Votre compte est protégé par 2FA',
            disabled: 'Ajoutez une couche de sécurité supplémentaire',
            active: 'Activé',
            enable: 'Activer',
            disable: 'Désactiver',
            confirmDisable: 'Êtes-vous sûr de vouloir désactiver la double authentification ?',
            setup: {
                title: 'Configuration de la 2FA',
                step1: "1. Scannez ce QR code avec votre app d'authentification",
                step2: '2. Entrez le code de vérification',
                orEnterCode: 'Ou entrez ce code :',
                verify: 'Vérifier'
            },
            backup: {
                title: 'Codes de secours',
                description: "Conservez ces codes en lieu sûr. Ils vous permettront de vous connecter si vous perdez l'accès à votre application d'authentification.",
                copy: 'Copier',
                saved: "J'ai sauvegardé mes codes"
            }
        },
        sessions: {
            title: 'Sessions actives',
            subtitle: 'Gérez vos connexions actives',
            view: 'Voir les sessions',
            unknownDevice: 'Appareil inconnu',
            lastActive: 'Dernière activité',
            current: 'Session actuelle',
            revokeAll: 'Déconnecter toutes les autres sessions',
            confirmRevokeAll: 'Déconnecter toutes les autres sessions ?'
        },
        connections: {
            title: 'Comptes liés',
            subtitle: 'Connectez vos comptes pour vous connecter plus rapidement',
            notConnected: 'Non connecté',
            connect: 'Connecter',
            disconnect: 'Déconnecter',
            confirmDisconnect: 'Déconnecter votre compte {{provider}} ?'
        },
        success: {
            updated: 'Profil mis à jour',
            passwordChanged: 'Mot de passe modifié',
            twoFAEnabled: 'Double authentification activée',
            twoFADisabled: 'Double authentification désactivée',
            codesCopied: 'Codes copiés',
            accountDisconnected: 'Compte {{provider}} déconnecté',
            sessionRevoked: 'Session révoquée',
            allSessionsRevoked: 'Toutes les sessions ont été révoquées'
        },
        errors: {
            loadFailed: 'Erreur lors du chargement du profil',
            avatarTooLarge: "L'image ne doit pas dépasser 2 MB",
            saveFailed: 'Erreur lors de la sauvegarde',
            passwordMismatch: 'Les mots de passe ne correspondent pas',
            passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
            passwordChangeFailed: 'Erreur lors du changement de mot de passe',
            setup2FAFailed: 'Erreur lors de la configuration 2FA',
            invalid2FACode: 'Entrez un code à 6 chiffres',
            invalidCode: 'Code invalide',
            disable2FAFailed: 'Erreur lors de la désactivation',
            disconnectFailed: 'Erreur lors de la déconnexion',
            loadSessionsFailed: 'Erreur lors du chargement des sessions',
            revokeFailed: 'Erreur lors de la révocation'
        }
    },

    // Proposal Form
    proposalForm: {
        title: 'Proposer un ajout',
        subtitle: 'Proposez de nouvelles catégories, tags ou versions de jeu',
        newProposal: 'Nouvelle proposition',
        myProposals: 'Mes propositions',
        forGame: 'Pour',
        rejectionReason: 'Raison',
        empty: "Vous n'avez pas encore fait de proposition",
        success: 'Proposition envoyée !',
        types: {
            tag: 'Tag',
            category: 'Catégorie',
            version: 'Version',
            gameVersion: 'Version de jeu'
        },
        status: {
            pending: 'En attente',
            approved: 'Approuvée',
            rejected: 'Refusée'
        },
        form: {
            type: 'Type',
            game: 'Jeu concerné',
            selectGame: '-- Choisir un jeu --',
            name: 'Nom',
            versionNumber: 'Numéro de version',
            versionPlaceholder: 'Ex: 1.20.4, b3258...',
            tagPlaceholder: 'Ex: HD, Optimisé, Animé...',
            categoryPlaceholder: 'Ex: Véhicules, Bâtiments...',
            justification: 'Justification',
            justificationPlaceholder: 'Expliquez pourquoi cet ajout serait utile...',
            submit: 'Envoyer la proposition'
        },
        errors: {
            fillRequired: 'Veuillez remplir tous les champs requis',
            submitFailed: "Erreur lors de l'envoi"
        }
    },

    // Purchases
    purchases: {
        title: 'Mes Achats',
        subtitle: 'Retrouvez tous vos produits achetés et téléchargez-les à tout moment',
        searchPlaceholder: 'Rechercher dans mes achats...',
        purchasedOn: 'Acheté le',
        viewProduct: 'Voir le produit',
        download: 'Télécharger',
        stats: {
            purchased: 'Produits achetés',
            downloads: 'Téléchargements'
        },
        empty: {
            title: 'Aucun achat',
            noResults: 'Aucun résultat',
            description: "Vous n'avez pas encore acheté de produits",
            tryOtherTerms: "Essayez avec d'autres termes de recherche",
            discover: 'Découvrir les produits'
        },
        success: {
            downloadStarted: 'Téléchargement démarré'
        },
        errors: {
            loadFailed: 'Erreur lors du chargement des achats',
            downloadFailed: 'Erreur lors du téléchargement'
        }
    },

    // Register
    register: {
        title: 'Créer un compte',
        subtitle: 'Rejoignez la communauté HytModel',
        username: "Nom d'utilisateur",
        usernamePlaceholder: 'votre_pseudo',
        email: 'Email',
        emailPlaceholder: 'vous@exemple.com',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        submit: 'Créer mon compte',
        or: 'ou',
        hasAccount: 'Déjà un compte ?',
        login: 'Se connecter',
        success: 'Compte créé avec succès !',
        requirements: {
            minLength: 'Au moins 8 caractères',
            uppercase: 'Une lettre majuscule',
            number: 'Un chiffre'
        },
        acceptTerms: {
            prefix: "J'accepte les",
            terms: "conditions d'utilisation",
            and: 'et la',
            privacy: 'politique de confidentialité'
        },
        errors: {
            fillAllFields: 'Veuillez remplir tous les champs',
            passwordMismatch: 'Les mots de passe ne correspondent pas',
            passwordInvalid: 'Le mot de passe ne respecte pas les critères',
            acceptTerms: "Veuillez accepter les conditions d'utilisation",
            registerFailed: "Erreur lors de l'inscription"
        }
    },

    // Seller Profile
    sellerProfile: {
        catalog: 'Catalogue',
        memberSince: 'Membre depuis',
        badges: {
            affiliated: 'Affilié'
        },
        stats: {
            products: 'Produits',
            sales: 'Ventes',
            avgRating: 'Note moyenne',
            totalViews: 'Vues totales'
        },
        social: {
            website: 'Site web'
        },
        tabs: {
            products: 'Produits',
            bundles: 'Bundles'
        },
        bundles: {
            others: 'autres',
            productsIncluded: 'produits inclus'
        },
        filters: {
            search: 'Rechercher...',
            allGames: 'Tous les jeux',
            allCategories: 'Toutes catégories'
        },
        sort: {
            newest: 'Plus récents',
            oldest: 'Plus anciens',
            priceAsc: 'Prix croissant',
            priceDesc: 'Prix décroissant',
            popular: 'Plus populaires',
            rating: 'Mieux notés'
        },
        empty: {
            title: 'Aucun produit',
            noMatch: 'Aucun produit ne correspond à vos critères',
            noProducts: "Ce vendeur n'a pas encore de produits",
            resetFilters: 'Réinitialiser les filtres'
        },
        notFound: {
            title: 'Vendeur non trouvé',
            description: "Ce profil n'existe pas ou n'est plus disponible",
            backToProducts: 'Retour aux produits'
        },
        errors: {
            notFound: 'Vendeur non trouvé'
        }
    },

    // Seller Proposals
    sellerProposals: {
        title: 'Mes propositions',
        subtitle: 'Proposez de nouvelles catégories, tags ou versions',
        newProposal: 'Nouvelle proposition',
        filter: 'Filtrer',
        confirmDelete: 'Supprimer cette proposition ?',
        rejectionReason: 'Raison du refus',
        proposedOn: 'Proposé le',
        types: {
            category: 'Catégorie',
            tag: 'Tag',
            version: 'Version',
            categoryDesc: 'Une nouvelle catégorie de produits',
            tagDesc: 'Un tag pour filtrer les produits',
            versionDesc: 'Une version/framework de jeu'
        },
        status: {
            pending: 'En attente',
            approved: 'Approuvée',
            rejected: 'Refusée'
        },
        stats: {
            total: 'Total',
            pending: 'En attente',
            approved: 'Approuvées',
            rejected: 'Refusées'
        },
        filters: {
            all: 'Toutes',
            pending: 'En attente',
            approved: 'Approuvées',
            rejected: 'Refusées'
        },
        modal: {
            title: 'Proposer un ajout',
            proposalType: 'Type de proposition',
            game: 'Jeu concerné',
            selectGame: 'Sélectionner un jeu...',
            proposedName: 'Nom proposé',
            justification: 'Justification',
            justificationPlaceholder: 'Expliquez pourquoi cet ajout serait utile...',
            characters: 'caractères',
            info: 'Votre proposition sera examinée par notre équipe. Vous serez notifié de la décision.',
            send: 'Envoyer',
            placeholders: {
                category: 'Ex: Intérieurs, Accessoires...',
                tag: 'Ex: Drift, Tuning, Luxe...',
                version: 'Ex: ox_inventory, ESX Legacy...',
                default: 'Entrez un nom...'
            }
        },
        empty: {
            title: 'Aucune proposition',
            noStatus: 'Aucune proposition avec ce statut',
            description: 'Proposez de nouvelles catégories, tags ou versions pour enrichir la plateforme !',
            makeProposal: 'Faire une proposition'
        },
        success: {
            sent: 'Proposition envoyée !',
            deleted: 'Proposition supprimée'
        },
        errors: {
            fillRequired: 'Veuillez remplir tous les champs obligatoires',
            selectGame: 'Veuillez sélectionner un jeu',
            sendFailed: "Erreur lors de l'envoi",
            deleteFailed: 'Erreur lors de la suppression'
        }
    },

    // Success (payment)
    success: {
        title: 'Paiement réussi !',
        subtitle: 'Merci pour votre achat. Vos modèles sont maintenant disponibles au téléchargement.',
        recentPurchases: 'Vos achats récents',
        download: 'Télécharger',
        noPurchases: 'Aucun achat récent trouvé',
        allPurchases: 'Tous mes achats',
        invoices: 'Mes factures',
        continue: 'Continuer'
    },

    // Upload
    upload: {
        title: 'Ajouter un produit',
        subtitle: 'Partagez votre création avec la communauté',
        submit: 'Ajouter le produit',
        uploading: 'Upload en cours...',
        success: 'Produit ajouté avec succès ! Il sera visible après validation.',
        file: {
            title: 'Fichier du produit',
            dragHere: 'Glissez votre fichier ici',
            orClick: 'ou cliquez pour parcourir (.zip, .rar, .fbx, .obj, .blend)'
        },
        images: {
            title: 'Images du produit',
            hint: "Ajoutez jusqu'à 10 images. Cliquez sur une image pour la définir comme image principale.",
            recommendations: 'Recommandations',
            recommendationsText: 'Format carré ou 4:3, dimensions idéales 1200x1200 px ou 1200x900 px. Minimum 400x400 px, maximum 5 MB par image.',
            primary: 'Principale',
            setAsPrimary: 'Définir comme principale',
            add: 'Ajouter',
            errors: {
                maxImages: 'Maximum 10 images autorisées',
                tooLarge: '{{name}} est trop lourd (max 5MB)',
                tooSmall: '{{name}} est trop petit (minimum 400x400 pixels)',
                invalid: "{{name}} n'est pas une image valide"
            }
        },
        info: {
            title: 'Informations',
            productTitle: 'Titre',
            titlePlaceholder: 'Ex: Pack de textures HD',
            description: 'Description',
            descriptionPlaceholder: 'Décrivez votre produit...',
            price: 'Prix (€)',
            minPrice: 'minimum 5€'
        },
        youtube: {
            title: 'Vidéo YouTube',
            invalid: 'URL YouTube invalide',
            preview: 'Aperçu'
        },
        gameCategory: {
            title: 'Jeu & Catégorie',
            game: 'Jeu',
            selectGame: 'Sélectionner un jeu',
            category: 'Catégorie',
            selectCategory: 'Sélectionner une catégorie',
            compatibleVersions: 'Versions compatibles'
        },
        dependencies: {
            title: 'Dépendances',
            subtitle: 'Produits ou ressources requis pour que votre produit fonctionne',
            add: 'Ajouter',
            none: 'Aucune dépendance',
            noneHint: "Ajoutez des dépendances si votre produit en nécessite d'autres",
            required: 'Requis',
            recommended: 'Recommandé',
            mandatory: 'Obligatoire',
            optional: 'Optionnel',
            siteProduct: 'Produit du site',
            version: 'Version',
            by: 'par',
            latestVersion: 'Dernière version',
            success: {
                added: 'Dépendance ajoutée',
                proposed: "Proposition envoyée ! Elle sera examinée par l'équipe."
            },
            errors: {
                selectDep: 'Sélectionnez une dépendance'
            },
            modal: {
                title: 'Ajouter une dépendance',
                tabs: {
                    predefined: 'Prédéfinies',
                    product: 'Produit du site',
                    propose: 'Proposer'
                },
                searchDep: 'Rechercher une dépendance...',
                searchProduct: 'Rechercher un produit...',
                noPredefined: 'Aucune dépendance disponible pour ce jeu',
                proposeHint: 'Proposez-en une dans l\'onglet "Proposer"',
                noDepFound: 'Aucune dépendance trouvée pour "{{query}}"',
                noProducts: 'Aucun autre produit disponible pour ce jeu',
                noProductFound: 'Aucun produit trouvé',
                selectVersion: 'Sélectionner une version',
                loadingVersions: 'Chargement des versions...',
                noVersions: 'Aucune version disponible',
                latestByDefault: 'La dernière version sera utilisée par défaut',
                autoUpdate: 'Toujours à jour automatiquement',
                current: 'Actuelle',
                proposeInfo: "Proposez une nouvelle dépendance. Elle sera examinée par notre équipe avant d'être ajoutée.",
                depName: 'Nom de la dépendance',
                depNamePlaceholder: 'Ex: Fabric, Forge, OptiFine...',
                logo: 'Logo',
                requiredVersion: 'Version requise',
                requiredVersionPlaceholder: 'Ex: 1.20+, 2.0.0 minimum...',
                note: 'Note',
                notePlaceholder: 'Information supplémentaire...',
                propose: 'Proposer'
            }
        },
        errors: {
            mustBeCreator: 'Vous devez être créateur pour ajouter des produits',
            selectFile: 'Veuillez sélectionner un fichier',
            enterTitle: 'Veuillez entrer un titre',
            minPrice: 'Le prix minimum est de 5€',
            selectGame: 'Veuillez sélectionner un jeu',
            selectCategory: 'Veuillez sélectionner une catégorie',
            invalidYoutube: 'URL YouTube invalide',
            uploadFailed: "Erreur lors de l'upload"
        }
    },

    // Edit Product
    editProduct: {
        title: 'Modifier le produit',
        subtitle: 'Modifiez les informations de votre produit',
        backToProducts: 'Retour à mes produits',
        saveAndSubmit: 'Enregistrer et soumettre',
        saving: {
            saving: 'Enregistrement...',
            images: 'Upload des images...'
        },
        fileVersions: {
            title: 'Versions du fichier',
            subtitle: 'Gérez les différentes versions de votre ressource',
            newVersion: 'Nouvelle version',
            addVersion: 'Ajouter une version',
            main: 'Principale',
            downloads: 'téléchargements',
            releaseNotes: 'Notes de version',
            compatibleWith: 'Compatible avec',
            setAsMain: 'Définir comme principale',
            mainNotDeletable: 'Version principale non supprimable',
            confirmDelete: 'Supprimer cette version ? Cette action est irréversible.',
            empty: {
                title: 'Aucune version',
                description: 'Ajoutez votre première version de fichier'
            },
            modal: {
                createTitle: 'Nouvelle version',
                editTitle: 'Modifier la version',
                versionNumber: 'Numéro de version',
                versionPlaceholder: 'Ex: 1.0.0, 2.1.3...',
                file: 'Fichier',
                clickToSelect: 'Cliquez pour sélectionner',
                fileFormats: 'ZIP, RAR, 7Z (max 500MB)',
                compatibleVersions: 'Versions du jeu compatibles',
                changelog: 'Notes de version (changelog)',
                changelogPlaceholder: 'Décrivez les changements de cette version...',
                mainVersion: 'Version principale',
                mainVersionDescription: 'Cette version sera téléchargée par défaut',
                mainVersionHint: "Impossible de retirer le statut principal. Définissez d'abord une autre version comme principale."
            },
            success: {
                added: 'Version ajoutée',
                updated: 'Version mise à jour',
                deleted: 'Version supprimée',
                mainUpdated: 'Version principale mise à jour'
            },
            errors: {
                versionRequired: 'Numéro de version requis',
                fileRequired: 'Fichier requis'
            }
        },
        dependencies: {
            title: 'Dépendances',
            subtitle: 'Produits ou ressources requis pour votre produit',
            gameLinked: 'Les dépendances sont liées au jeu',
            selected: 'sélectionné',
            empty: 'Aucune dépendance',
            required: 'Requis',
            recommended: 'Recommandé',
            siteProduct: 'Produit du site',
            version: 'Version',
            latestVersion: 'Dernière version',
            confirmDelete: 'Supprimer cette dépendance ?',
            tabs: {
                predefined: 'Prédéfinies',
                siteProduct: 'Produit du site',
                propose: 'Proposer'
            },
            modal: {
                title: 'Ajouter une dépendance',
                game: 'Jeu',
                selectDependency: 'Sélectionner une dépendance',
                searchDependency: 'Rechercher une dépendance...',
                noDependencies: 'Aucune dépendance disponible pour ce jeu',
                proposeHint: 'Proposez-en une dans l\'onglet "Proposer"',
                noResults: 'Aucune dépendance trouvée pour',
                selectProduct: 'Sélectionner un produit du site',
                searchProduct: 'Rechercher un produit...',
                noProducts: 'Aucun autre produit disponible pour ce jeu',
                noProductResults: 'Aucun produit trouvé',
                productSelected: 'Produit sélectionné',
                selectVersion: 'Sélectionner une version',
                loadingVersions: 'Chargement des versions...',
                noVersions: 'Aucune version disponible',
                latestDefault: 'La dernière version sera utilisée par défaut',
                autoUpdate: 'Toujours à jour automatiquement',
                current: 'Actuelle',
                proposeInfo: 'Proposez une nouvelle dépendance. Elle sera examinée par notre équipe.',
                name: 'Nom',
                namePlaceholder: 'Ex: Fabric, Forge...',
                logo: 'Logo (optionnel)',
                requiredVersion: 'Version requise (optionnel)',
                versionPlaceholder: 'Ex: 1.20+...',
                note: 'Note (optionnel)',
                notePlaceholder: 'Info supplémentaire...',
                propose: 'Proposer'
            },
            success: {
                added: 'Dépendance ajoutée',
                deleted: 'Dépendance supprimée',
                proposed: 'Proposition envoyée !'
            },
            errors: {
                selectDependency: 'Sélectionnez une dépendance'
            }
        },
        images: {
            title: 'Images du produit',
            clickToSetPrimary: 'Cliquez sur une image pour la définir comme image principale.',
            recommendations: 'Recommandations',
            formatHint: 'Format carré ou 4:3, dimensions idéales 1200x1200 px ou 1200x900 px. Minimum 400x400 px, maximum 5 MB par image.',
            primary: 'Principale',
            restore: 'Restaurer',
            new: 'Nouvelle',
            success: {
                primaryUpdated: 'Image principale mise à jour'
            },
            errors: {
                maxImages: 'Maximum 10 images autorisées',
                tooLarge: '{{name}} est trop lourd (max 5MB)',
                tooSmall: '{{name}} est trop petit (minimum 400x400 pixels)',
                invalid: "{{name}} n'est pas une image valide",
                updateFailed: 'Erreur lors de la mise à jour'
            }
        },
        info: {
            title: 'Informations',
            productTitle: 'Titre',
            titlePlaceholder: 'Ex: Pack de textures HD',
            description: 'Description',
            descriptionPlaceholder: 'Décrivez votre produit...',
            price: 'Prix (€)',
            minPrice: 'minimum 5€'
        },
        youtube: {
            title: 'Vidéo YouTube',
            invalid: 'URL YouTube invalide',
            preview: 'Aperçu'
        },
        gameCategory: {
            title: 'Jeu & Catégorie',
            game: 'Jeu',
            selectGame: 'Sélectionner un jeu',
            category: 'Catégorie',
            selectCategory: 'Sélectionner une catégorie',
            compatibleVersions: 'Versions compatibles'
        },
        tags: {
            title: 'Tags'
        },
        revalidation: {
            title: 'Revalidation requise',
            description: 'Toute modification de votre produit nécessitera une nouvelle validation par notre équipe. Votre produit sera temporairement masqué jusqu\'à son approbation.'
        },
        success: {
            updated: 'Produit mis à jour ! Il sera visible après validation.'
        },
        errors: {
            unauthorized: "Vous n'êtes pas autorisé à modifier ce produit",
            notFound: 'Produit non trouvé',
            titleRequired: 'Veuillez entrer un titre',
            minPrice: 'Le prix minimum est de 5€',
            gameRequired: 'Veuillez sélectionner un jeu',
            invalidYoutube: 'URL YouTube invalide',
            updateFailed: 'Erreur lors de la mise à jour'
        }
    },

    // Download Version Selector
    downloadSelector: {
        download: 'Télécharger',
        downloadVersion: 'Télécharger v{{version}}',
        filterByGameVersion: 'Filtrer par version du jeu',
        allVersions: 'Toutes les versions',
        fileVersion: 'Version du fichier',
        selectVersion: 'Sélectionner une version',
        latest: 'Dernière',
        noCompatibleVersion: 'Aucune version compatible',
        viewAllVersions: 'Voir toutes les versions',
        compatibleWith: 'Compatible avec :',
        versionsAvailable: '{{count}} versions disponibles',
        success: {
            started: 'Téléchargement démarré'
        },
        errors: {
            selectVersion: 'Sélectionnez une version',
            downloadFailed: 'Erreur de téléchargement'
        }
    },

    // Dashboard
    dashboard: {
        greeting: 'Bonjour, {{username}}',
        welcomeMessage: 'Bienvenue sur votre tableau de bord',
        addProduct: 'Ajouter un produit',
        tabs: {
            overview: "Vue d'ensemble",
            customOrders: 'Sur mesure',
            proposals: 'Propositions',
            dependencies: 'Dépendances',
            bundles: 'Bundles'
        },
        quickActions: {
            myPurchases: 'Mes achats',
            productsCount: '{{count}} produits',
            invoices: 'Factures',
            viewAll: 'Voir tout',
            myProducts: 'Mes produits',
            manage: 'Gérer',
            settings: 'Paramètres',
            configure: 'Configurer'
        },
        stats: {
            totalRevenue: 'Revenus totaux',
            totalSales: 'Ventes totales',
            lastSale: 'Dernière vente',
            lastPayout: 'Dernier paiement',
            none: 'Aucun'
        },
        customOrdersCta: {
            title: '{{count}} demande(s) sur mesure disponible(s)',
            description: 'Des clients recherchent vos compétences ! Faites une offre et décrochez de nouvelles commandes.'
        },
        proposalsCta: {
            title: 'Proposez vos idées',
            description: 'Suggérez de nouvelles catégories, tags ou versions pour enrichir la plateforme !'
        },
        stripe: {
            title: 'Configurez vos paiements',
            description: 'Connectez votre compte Stripe pour recevoir vos paiements automatiquement.',
            connect: 'Connecter Stripe',
            connecting: 'Connexion...'
        },
        recentSales: {
            title: 'Ventes récentes',
            viewAll: 'Voir tout',
            product: 'Produit'
        },
        recentPurchases: {
            title: 'Mes derniers achats',
            viewAll: 'Voir tout'
        },
        becomeCreator: {
            title: 'Devenez créateur',
            description: 'Vendez vos créations et gagnez jusqu\'à 90% sur chaque vente.',
            learnMore: 'En savoir plus'
        },
        dependencies: {
            title: 'Propositions de dépendances',
            subtitle: 'Proposez de nouvelles dépendances pour les produits',
            propose: 'Proposer',
            reason: 'Raison',
            proposedOn: 'Proposée le',
            confirmDelete: 'Supprimer cette proposition ?',
            whatIs: {
                title: "Qu'est-ce qu'une dépendance ?",
                description: "Une dépendance est une ressource externe nécessaire pour faire fonctionner un produit (ex: Fabric, Forge, OptiFine pour Minecraft). Proposez des dépendances manquantes et notre équipe les ajoutera après validation."
            },
            empty: {
                title: 'Aucune proposition',
                description: 'Proposez une dépendance manquante pour les produits'
            },
            status: {
                pending: 'En attente',
                approved: 'Approuvée',
                rejected: 'Refusée'
            },
            modal: {
                title: 'Proposer une dépendance',
                logo: 'Logo (optionnel)',
                clickToUpload: 'Cliquez pour uploader',
                logoFormat: 'PNG, JPG (max 2MB)',
                name: 'Nom',
                namePlaceholder: 'Ex: Fabric, Forge, OptiFine...',
                game: 'Jeu',
                selectGame: 'Sélectionner un jeu',
                description: 'Description (optionnel)',
                descriptionPlaceholder: 'Courte description...',
                website: 'Site web (optionnel)'
            },
            success: {
                proposed: 'Proposition envoyée !',
                deleted: 'Proposition supprimée'
            },
            errors: {
                logoTooLarge: 'Logo trop volumineux (max 2MB)',
                nameAndGameRequired: 'Nom et jeu requis'
            }
        },
        errors: {
            stripeConnect: 'Erreur lors de la connexion à Stripe',
            generic: 'Erreur'
        }
    },

    // Custom Request Detail
    customRequestDetail: {
        backToRequests: 'Retour aux demandes',
        createdOn: 'Créée le',
        description: 'Description',
        attachments: 'Pièces jointes',
        offersReceived: 'Offres reçues',
        conversations: 'Conversations',
        information: 'Informations',
        game: 'Jeu',
        category: 'Catégorie',
        budget: 'Budget',
        deadline: 'Deadline',
        orders: 'commandes',
        days: 'jour(s)',
        contact: 'Contacter',
        reject: 'Refuser',
        accept: 'Accepter',
        confirmAccept: 'Accepter cette offre ? Les autres offres seront automatiquement refusées.',
        confirmReject: 'Refuser cette offre ?',
        status: {
            pending: 'En attente de validation',
            approved: 'Recherche de créateur',
            assigned: 'Créateur assigné',
            inProgress: 'En cours',
            awaitingFinalPayment: 'En attente paiement final',
            completed: 'Terminée',
            cancelled: 'Annulée',
            rejected: 'Refusée'
        },
        offerStatus: {
            pending: 'En attente',
            accepted: 'Acceptée',
            rejected: 'Refusée',
            withdrawn: 'Retirée'
        },
        pendingValidation: {
            title: 'En attente de validation',
            description: 'Notre équipe examine votre demande. Vous serez notifié dès qu\'elle sera approuvée.'
        },
        rejected: {
            title: 'Demande refusée',
            reason: 'Raison :'
        },
        searchingCreator: {
            title: 'En recherche de créateur',
            description: 'Votre demande est visible par nos créateurs affiliés. Vous recevrez bientôt des offres !'
        },
        goodToKnow: {
            title: 'Bon à savoir',
            payment: 'Paiement en 2 fois : 50% + 50%',
            cancellation: "Annulation : 50% de l'acompte remboursé",
            files: 'Fichiers accessibles après paiement complet'
        },
        success: {
            offerAccepted: 'Offre acceptée ! Vous pouvez maintenant procéder au paiement.',
            offerRejected: 'Offre refusée'
        },
        errors: {
            notFound: 'Demande non trouvée',
            acceptFailed: "Erreur lors de l'acceptation",
            conversationFailed: 'Erreur lors de la création de la conversation',
            generic: 'Erreur'
        }
    },

    // Custom Orders (Client Page)
    customOrders: {
        title: 'Commandes sur mesure',
        subtitle: 'Demandez une création personnalisée à nos créateurs',
        newRequest: 'Nouvelle demande',
        offers: 'offre(s)',
        by: 'par',
        progress: 'Progression',
        paid50: '50% payé',
        paid100: '100% payé',
        status: {
            pending: 'En attente de validation',
            approved: 'Recherche de créateur',
            assigned: 'Créateur assigné',
            inProgress: 'En cours',
            awaitingFinalPayment: 'En attente paiement final',
            completed: 'Terminée',
            cancelled: 'Annulée',
            rejected: 'Refusée'
        },
        howItWorks: {
            title: 'Comment ça fonctionne ?',
            step1: {
                title: 'Décrivez votre besoin',
                description: 'Détaillez votre projet'
            },
            step2: {
                title: 'Recevez des offres',
                description: 'Nos créateurs vous proposent'
            },
            step3: {
                title: "Payez 50% d'acompte",
                description: 'Le travail commence'
            },
            step4: {
                title: 'Payez le solde',
                description: 'Recevez vos fichiers'
            }
        },
        tabs: {
            myRequests: 'Mes demandes',
            myOrders: 'Mes commandes'
        },
        empty: {
            noRequests: 'Aucune demande',
            noRequestsDescription: "Vous n'avez pas encore fait de demande sur mesure",
            createFirst: 'Créer ma première demande',
            noOrders: 'Aucune commande',
            noOrdersDescription: "Vous n'avez pas encore de commande en cours"
        },
        errors: {
            loadFailed: 'Erreur lors du chargement'
        }
    },

    // Custom Order Detail
    orderDetail: {
        beforeOrder: 'avant commande',
        file: 'Fichier',
        orderWith: 'Commande avec',
        noMessages: 'Aucun message',
        messagePlaceholder: 'Écrivez votre message...',
        disputeBanner: 'Litige en cours - Continuez à communiquer pour résoudre le problème',
        details: 'Détails',
        totalPrice: 'Prix total',
        deposit: 'Acompte (50%)',
        balance: 'Solde (50%)',
        pending: 'en attente',
        estimatedDelivery: 'Livraison estimée',
        pay: 'Payer',
        finalFiles: 'Fichiers finaux',
        status: {
            awaitingPayment: 'En attente de paiement',
            inProgress: 'En cours',
            pendingReview: 'En attente de validation',
            awaitingFinalPayment: 'Paiement final requis',
            completed: 'Terminée',
            disputed: 'Litige',
            cancelled: 'Annulée',
            refunded: 'Remboursée'
        },
        paymentRequired: {
            title: 'Paiement requis',
            description: "Payez l'acompte de 50% pour démarrer la commande"
        },
        deliver: {
            title: 'Livrer la commande',
            description: 'Uploadez vos fichiers finaux puis livrez',
            addMore: "Ajouter d'autres fichiers",
            selectFiles: 'Sélectionner les fichiers',
            messagePlaceholder: 'Message de livraison (optionnel)...',
            button: 'Livrer ({{count}} fichier(s))',
            defaultMessage: 'Livraison effectuée !'
        },
        review: {
            title: 'Livraison reçue',
            description: 'Vérifiez le travail et validez ou demandez des modifications',
            validate: 'Valider',
            requestRevisions: 'Demander des révisions'
        },
        finalPayment: {
            title: 'Paiement final',
            description: 'Payez le solde pour finaliser la commande et accéder aux fichiers'
        },
        withdraw: {
            title: 'Rétractation',
            description: 'Vous pouvez annuler la commande en cours.',
            refund25: "Vous récupérez 25% de l'acompte",
            creator20: 'Le créateur reçoit 20% (travail effectué)',
            button: 'Me rétracter'
        },
        problem: {
            title: 'Un problème ?',
            description: 'Si les fichiers ne fonctionnent pas correctement, signalez-le.',
            previousClaims: '{{count}} réclamation(s) précédente(s) résolue(s)',
            button: 'Signaler un problème'
        },
        claim: {
            title: 'Réclamation en cours',
            creatorMessage: 'Le client a signalé un problème. Veuillez envoyer un correctif.',
            clientMessage: 'Votre réclamation est en cours de traitement.'
        },
        fixes: {
            title: 'Correctifs reçus ({{count}})',
            version: 'Version',
            accepted: 'Accepté',
            rejected: 'Refusé',
            accept: 'Accepter',
            reject: 'Refuser'
        },
        sendFix: {
            title: 'Envoyer un correctif',
            addFiles: 'Ajouter des fichiers',
            selectFiles: 'Sélectionner fichiers corrigés',
            messagePlaceholder: 'Expliquez les corrections apportées...',
            button: 'Envoyer le correctif'
        },
        completed: {
            title: 'Commande terminée !',
            thanks: 'Merci pour votre confiance'
        },
        success: {
            delivered: 'Commande livrée !',
            approved: 'Livraison validée !',
            revisionRequested: 'Demande de révision envoyée',
            withdrawn: 'Rétractation effectuée. Remboursement: {{amount}}€',
            claimOpened: 'Réclamation envoyée. Le créateur et notre équipe ont été notifiés.',
            fixSent: 'Correctif envoyé au client',
            fixAccepted: 'Correctif accepté ! Réclamation clôturée.',
            feedbackSent: 'Feedback envoyé au créateur'
        },
        errors: {
            notFound: 'Commande non trouvée',
            sendFailed: "Erreur lors de l'envoi",
            maxFiles: 'Maximum 5 fichiers',
            noDeliveryFiles: 'Veuillez ajouter au moins un fichier à livrer',
            deliveryFailed: 'Erreur lors de la livraison',
            paymentRedirect: 'Erreur lors de la redirection vers le paiement',
            noFixFiles: 'Veuillez ajouter des fichiers corrigés',
            generic: 'Erreur'
        }
    },

    // Custom Order Conversation
    conversation: {
        file: 'Fichier',
        close: 'Clôturer',
        reject: 'Refuser',
        accept: 'Accepter',
        delay: 'Délai',
        days: 'jour(s)',
        makeOffer: 'Faire une offre',
        modifyOffer: "Modifier l'offre",
        awaitingClientResponse: 'En attente de réponse du client',
        offerAccepted: 'Offre acceptée !',
        payDepositToStart: "Payez l'acompte de 50% pour démarrer",
        pay: 'Payer',
        redirectingToPayment: 'Redirection vers le paiement...',
        noMessages: 'Aucun message',
        startConversation: 'Commencez la conversation !',
        conversationClosed: 'Conversation clôturée',
        willBeDeleted: 'Cette conversation sera supprimée automatiquement',
        messagePlaceholder: 'Écrivez votre message...',
        confirmAcceptOffer: 'Accepter cette offre ? Vous devrez ensuite payer 50% du montant.',
        status: {
            closed: 'Clôturée',
            offerAccepted: 'Offre acceptée',
            offer: 'Offre'
        },
        offerModal: {
            title: 'Faire une offre',
            editTitle: "Modifier l'offre",
            priceLabel: 'Prix (€)',
            daysLabel: 'Délai (jours)',
            messageLabel: 'Message (optionnel)',
            messagePlaceholder: 'Détails supplémentaires...',
            send: 'Envoyer',
            errors: {
                minPrice: 'Prix minimum: 5€',
                minDays: 'Délai minimum: 1 jour'
            }
        },
        rejectModal: {
            title: "Refuser l'offre",
            reasonLabel: 'Raison (optionnel)',
            reasonPlaceholder: 'Expliquez pourquoi vous refusez...',
            closeDefinitely: 'Clôturer définitivement',
            closeHint: 'La conversation sera supprimée dans 48h',
            reject: 'Refuser',
            rejectAndClose: 'Refuser et clôturer'
        },
        closeModal: {
            title: 'Clôturer la conversation',
            warning: "Cette action est définitive. Si vous avez une offre en attente, elle sera retirée.",
            reasonLabel: 'Raison (optionnel)',
            reasonPlaceholder: 'Expliquez pourquoi vous clôturez...',
            close: 'Clôturer'
        },
        success: {
            offerSent: 'Offre envoyée !',
            offerAccepted: 'Offre acceptée !',
            offerRejected: 'Offre refusée',
            conversationClosed: 'Conversation clôturée'
        },
        errors: {
            loadFailed: 'Erreur lors du chargement',
            sendFailed: "Erreur lors de l'envoi",
            generic: 'Erreur',
            maxFiles: 'Maximum 5 fichiers'
        }
    },

    // Creator Custom Orders
    creatorCustomOrders: {
        budget: 'Budget',
        toDefine: 'À définir',
        description: 'Description',
        deadline: 'Deadline',
        attachments: 'Pièces jointes',
        file: 'Fichier',
        offersReceived: '{{count}} offre(s) reçue(s)',
        messages: 'Messages',
        contact: 'Contacter',
        makeOffer: 'Faire une offre',
        offerSent: 'Offre envoyée',
        client: 'Client',
        offer: 'Offre',
        offerRejected: 'Offre refusée',
        amount: 'Montant',
        deliver: 'Livrer',
        requestStatus: {
            available: 'Disponible',
            assigned: 'Assignée',
            inProgress: 'En cours',
            completed: 'Terminée'
        },
        orderStatus: {
            awaitingPayment: 'Attente paiement',
            inProgress: 'En cours',
            awaitingFinal: 'Attente solde',
            completed: 'Terminée',
            cancelled: 'Annulée',
            disputed: 'Litige'
        },
        badges: {
            inDiscussion: 'En discussion',
            offerSent: 'Offre envoyée',
            accepted: 'Acceptée'
        },
        offerModal: {
            title: 'Faire une offre',
            for: 'Pour',
            clientBudget: 'Budget du client',
            notSpecified: 'Non spécifié',
            yourPrice: 'Votre prix (€)',
            paymentInfo: 'Le client paiera 50% à la commande, 50% à la livraison',
            estimatedDays: 'Délai estimé (jours)',
            clientDeadline: 'Deadline client',
            messageLabel: 'Message au client',
            messagePlaceholder: 'Présentez votre approche, vos compétences, posez des questions si nécessaire...',
            minChars: '{{count}}/20 caractères minimum',
            send: "Envoyer l'offre",
            success: 'Offre envoyée !',
            errors: {
                minPrice: 'Prix minimum: 5€',
                minDays: 'Délai minimum: 1 jour',
                messageTooShort: 'Message trop court (min 20 caractères)',
                sendFailed: "Erreur lors de l'envoi"
            }
        },
        payment: {
            deposit: 'Acompte (50%)',
            balance: 'Solde (50%)',
            paid: '✓ Payé',
            pending: 'En attente',
            afterDelivery: 'Après livraison'
        },
        delivery: {
            placeholder: 'Message de livraison, instructions, liens de téléchargement...',
            confirm: 'Confirmer la livraison',
            messageRequired: 'Ajoutez un message de livraison',
            success: 'Livraison envoyée ! En attente du paiement final.',
            error: 'Erreur'
        },
        awaitingFinalPayment: {
            title: 'En attente du paiement final',
            description: 'Le client doit payer le solde pour finaliser'
        },
        orderCompleted: {
            title: 'Commande terminée !',
            description: 'Le paiement a été versé sur votre compte'
        },
        stats: {
            availableRequests: 'Demandes disponibles',
            inProgress: 'En cours',
            completed: 'Terminées',
            customRevenue: 'Revenus sur mesure',
            unreadMessages: 'Messages non lus'
        },
        tabs: {
            availableRequests: 'Demandes disponibles',
            negotiations: 'Négociations',
            myOrders: 'Mes commandes'
        },
        empty: {
            noRequests: 'Aucune demande disponible',
            requestsWillAppear: 'Les nouvelles demandes apparaîtront ici',
            noNegotiations: 'Aucune négociation en cours',
            contactClients: 'Contactez des clients pour commencer à négocier',
            noOrders: 'Aucune commande',
            ordersWillAppear: 'Vos commandes sur mesure apparaîtront ici'
        },
        errors: {
            conversationFailed: 'Erreur lors de la création de la conversation'
        }
    },

    // Checkout Success
    checkoutSuccess: {
        title: 'Paiement réussi !',
        description: 'Merci pour votre achat. Vos produits sont maintenant disponibles.',
        recentPurchases: 'Vos achats récents',
        loadingPurchases: 'Chargement de vos achats...',
        download: 'Télécharger',
        purchasesAppearSoon: 'Vos achats apparaîtront dans quelques instants...',
        refresh: 'Rafraîchir',
        invoiceSent: 'Facture envoyée',
        invoiceDescription: 'Une facture a été envoyée à votre adresse email. Vous pouvez également retrouver vos achats dans votre espace personnel.',
        viewPurchases: 'Voir mes achats',
        continueShopping: 'Continuer mes achats'
    },

    // Cart
    cart: {
        title: 'Mon panier',
        productCount: '{{count}} produit(s)',
        clearCart: 'Vider le panier',
        confirmClear: 'Voulez-vous vraiment vider votre panier ?',
        checkout: 'Passer au paiement',
        securePayment: 'Paiement sécurisé par Stripe',
        empty: {
            title: 'Votre panier est vide',
            description: 'Découvrez notre collection de produits premium',
            explore: 'Explorer les produits'
        },
        summary: {
            title: 'Récapitulatif',
            subtotal: 'Sous-total',
            vatIncluded: 'TVA incluse',
            total: 'Total'
        },
        errors: {
            checkoutFailed: 'Erreur lors du checkout'
        }
    },

    // Cancel (Payment)
    cancel: {
        title: 'Paiement annulé',
        description: "Votre paiement a été annulé. Aucun montant n'a été débité de votre compte. Vos articles sont toujours dans votre panier.",
        problemTitle: 'Un problème ?',
        problemDescription: "Si vous avez rencontré un problème lors du paiement, n'hésitez pas à réessayer. Si le problème persiste, contactez notre support.",
        backToCart: 'Retour au panier',
        continueShopping: 'Continuer les achats',
        retryHint: 'Vous pouvez réessayer le paiement à tout moment'
    },

    // Bundle Detail
    bundleDetail: {
        includedProducts: 'Produits inclus ({{count}})',
        included: 'Inclus',
        youSave: 'Vous économisez {{amount}}€',
        discountApplied: 'Remise appliquée',
        products: 'Produits',
        yourBundle: "C'est votre bundle",
        bundlePurchased: 'Bundle acheté',
        viewPurchases: 'Voir mes achats',
        buyBundle: 'Acheter le bundle',
        purchaseInfo: 'En achetant ce bundle, vous obtenez tous les produits inclus.',
        validUntil: "Offre valable jusqu'au {{date}}",
        success: {
            purchased: 'Bundle acheté avec succès !'
        },
        errors: {
            notFound: 'Bundle non trouvé',
            loginRequired: 'Connectez-vous pour acheter',
            purchaseFailed: "Erreur lors de l'achat"
        }
    },

    // Become Creator
    becomeCreator: {
        title: 'Devenir vendeur',
        subtitle: 'Rejoignez notre communauté de créateurs et vendez vos créations sur HytModel. Remplissez ce formulaire pour soumettre votre candidature.',
        backToHome: "Retour à l'accueil",
        types: {
            nonAffiliated: {
                title: 'Non-affilié',
                subtitle: 'Vendeur standard'
            },
            affiliated: {
                title: 'Affilié',
                subtitle: 'Partenaire officiel'
            },
            hytStudio: {
                title: 'HytStudio',
                subtitle: 'Équipe interne',
                description: 'Créations officielles HytModel'
            },
            popular: 'POPULAIRE',
            ofRevenue: 'de vos revenus',
            forPlatform: 'pour la plateforme',
            commission: 'Commission plateforme : {{percent}}%'
        },
        form: {
            presentYourself: 'Présentez-vous',
            presentPlaceholder: 'Parlez-nous de vous, de votre parcours et de vos motivations pour rejoindre HytModel...',
            yourPortfolio: 'Votre portfolio',
            portfolioUrlLabel: 'Lien vers votre portfolio (optionnel)',
            workDescriptionLabel: 'Décrivez votre travail et vos créations',
            workDescriptionPlaceholder: 'Décrivez les types de créations que vous réalisez, vos spécialités, les logiciels que vous utilisez...',
            experienceLabel: 'Expérience (optionnel)',
            experiencePlaceholder: "Combien d'années d'expérience avez-vous ? Avez-vous déjà vendu sur d'autres plateformes ?",
            socialNetworks: 'Réseaux sociaux (optionnel)',
            website: 'Site web',
            sending: 'Envoi en cours...',
            submit: 'Envoyer ma demande'
        },
        important: {
            title: 'Important',
            description: "Votre demande sera examinée par notre équipe dans les plus brefs délais. Nous vous contacterons par email avec notre décision. Les vendeurs commencent au statut \"Non-affilié\" (85% des revenus). Le statut \"Affilié\" (90%) est accordé aux créateurs de qualité après évaluation."
        },
        status: {
            pendingTitle: "Demande en cours d'examen",
            pendingDescription: 'Votre demande a été soumise le {{date}}. Notre équipe l\'examine actuellement.',
            pendingHint: 'Vous recevrez une réponse dans les prochains jours.',
            approvedTitle: 'Félicitations ! 🎉',
            approvedDescription: 'Votre demande a été approuvée ! Vous pouvez maintenant vendre sur HytModel.',
            goToDashboard: 'Accéder à mon dashboard',
            rejectedTitle: 'Demande refusée',
            rejectedDescription: "Malheureusement, votre demande n'a pas été acceptée.",
            reason: 'Raison',
            rejectedHint: 'Vous pouvez améliorer votre portfolio et soumettre une nouvelle demande.',
            newRequest: 'Faire une nouvelle demande'
        },
        success: {
            requestSent: 'Demande envoyée avec succès !'
        },
        errors: {
            presentRequired: 'Veuillez vous présenter',
            workDescriptionRequired: 'Veuillez décrire votre travail',
            sendFailed: "Erreur lors de l'envoi"
        }
    },

    // Settings (Admin)
    settings: {
        title: 'Paramètres',
        tabs: {
            games: 'Jeux',
            categories: 'Catégories',
            tags: 'Tags',
            versions: 'Versions',
            dependencies: 'Dépendances'
        },
        chooseGame: '-- Choisir un jeu --',
        clickToUpload: 'Cliquez pour uploader',
        imageFormats: 'PNG, JPG, SVG (max 2MB)',
        choose: 'Choisir',
        fields: {
            name: 'Nom',
            description: 'Description',
            shortDescription: 'Courte description...',
            website: 'Site web',
            game: 'Jeu',
            slug: 'Slug (URL)'
        },
        actions: {
            create: 'Créer',
            edit: 'Modifier',
            delete: 'Supprimer',
            enable: 'Activer',
            disable: 'Désactiver'
        },
        games: {
            new: 'Nouveau jeu',
            newTitle: 'Nouveau jeu',
            editTitle: 'Modifier le jeu',
            noGames: 'Aucun jeu créé',
            nameLabel: 'Nom du jeu',
            namePlaceholder: 'Ex: FiveM, Minecraft...',
            iconLabel: 'Logo / Icône (carré, 200x200 recommandé)',
            bannerLabel: 'Bannière (1920x400 recommandé)',
            banner: 'Bannière',
            chooseBanner: 'Choisir une bannière'
        },
        categories: {
            selectGame: 'Sélectionnez un jeu pour gérer ses catégories',
            selectGameToView: 'Sélectionnez un jeu pour voir ses catégories',
            new: 'Nouvelle catégorie',
            newTitleFor: 'Nouvelle catégorie pour {{game}}',
            editTitle: 'Modifier la catégorie',
            noneForGame: 'Aucune catégorie pour {{game}}',
            createFirst: 'Créer la première catégorie',
            countForGame: '{{count}} catégorie(s) pour {{game}}',
            namePlaceholder: 'Ex: Véhicules, Bâtiments...'
        },
        tags: {
            selectGame: 'Sélectionnez un jeu pour gérer ses tags',
            selectGameToView: 'Sélectionnez un jeu pour voir ses tags',
            new: 'Nouveau tag',
            newTitleFor: 'Nouveau tag pour {{game}}',
            editTitle: 'Modifier le tag',
            searchPlaceholder: 'Rechercher un tag...',
            noFound: 'Aucun tag trouvé',
            noneForGame: 'Aucun tag pour {{game}}',
            createFirst: 'Créer le premier tag',
            countForGame: '{{count}} tag(s) pour {{game}}',
            nameLabel: 'Nom du tag',
            namePlaceholder: 'Ex: HD, Animé, Optimisé...'
        },
        versions: {
            selectGame: 'Sélectionnez un jeu pour gérer ses versions',
            selectGameToView: 'Sélectionnez un jeu pour voir ses versions',
            new: 'Nouvelle version',
            newTitleFor: 'Nouvelle version pour {{game}}',
            editTitle: 'Modifier la version',
            searchPlaceholder: 'Rechercher une version...',
            noFound: 'Aucune version trouvée',
            noneForGame: 'Aucune version pour {{game}}',
            createFirst: 'Créer la première version',
            countForGame: '{{count}} version(s) pour {{game}}',
            versionLabel: 'Version',
            versionPlaceholder: 'Ex: 1.20.4, b3258, ESX 1.9...',
            versionHint: 'Entrez le numéro ou nom de la version du jeu'
        },
        dependencies: {
            selectGame: 'Sélectionnez un jeu pour gérer ses dépendances',
            selectGameToView: 'Sélectionnez un jeu pour voir ses dépendances',
            new: 'Nouvelle dépendance',
            newTitle: 'Nouvelle dépendance',
            editTitle: 'Modifier la dépendance',
            searchPlaceholder: 'Rechercher une dépendance...',
            noFound: 'Aucune dépendance trouvée',
            noneForGame: 'Aucune dépendance pour {{game}}',
            create: 'Créer une dépendance',
            disabled: 'Désactivée',
            usedBy: 'Utilisée par {{count}} produit(s)',
            website: 'Site web',
            logoOptional: 'Logo (optionnel)',
            namePlaceholder: 'Ex: Fabric, Forge, OptiFine...'
        },
        confirmDelete: {
            game: 'Supprimer le jeu "{{name}}" ? Cela peut affecter les produits associés.',
            category: 'Supprimer la catégorie "{{name}}" ?',
            tag: 'Supprimer le tag "{{name}}" ?',
            version: 'Supprimer la version "{{name}}" ?',
            dependency: 'Supprimer la dépendance "{{name}}" ?'
        },
        success: {
            gameCreated: 'Jeu créé',
            gameModified: 'Jeu modifié',
            gameDeleted: 'Jeu supprimé',
            categoryCreated: 'Catégorie créée',
            categoryModified: 'Catégorie modifiée',
            categoryDeleted: 'Catégorie supprimée',
            tagCreated: 'Tag créé',
            tagModified: 'Tag modifié',
            tagDeleted: 'Tag supprimé',
            versionCreated: 'Version créée',
            versionModified: 'Version modifiée',
            versionDeleted: 'Version supprimée',
            dependencyCreated: 'Dépendance créée',
            dependencyModified: 'Dépendance modifiée',
            dependencyDeleted: 'Dépendance supprimée',
            dependencyEnabled: 'Dépendance activée',
            dependencyDisabled: 'Dépendance désactivée'
        },
        errors: {
            generic: 'Erreur',
            loadFailed: 'Erreur lors du chargement',
            loadGames: 'Erreur lors du chargement des jeux',
            selectGameFirst: "Sélectionnez un jeu d'abord",
            nameRequired: 'Le nom est requis',
            versionRequired: 'La version est requise',
            deleteFailed: 'Erreur lors de la suppression',
            logoTooLarge: 'Logo trop volumineux (max 2MB)'
        }
    },

    // Sellers (Admin)
    sellers: {
        title: 'Gestion des vendeurs',
        types: {
            nonAffiliated: 'Non-affilié',
            affiliated: 'Affilié'
        },
        commission: 'Commission',
        platform: 'Plateforme',
        sales: 'ventes',
        generated: 'générés',
        stats: {
            activeSellers: 'Vendeurs actifs',
            totalRevenue: 'Revenus totaux',
            commissions: 'Commissions',
            pendingRequests: 'Demandes en attente'
        },
        tabs: {
            requests: 'Demandes',
            eligible: 'Éligibles Affilié',
            activeSellers: 'Vendeurs actifs'
        },
        actions: {
            approve: 'Approuver',
            reject: 'Refuser',
            promoteAffiliate: 'Promouvoir Affilié'
        },
        requests: {
            noPending: 'Aucune demande en attente',
            allProcessed: 'Toutes les demandes ont été traitées',
            pending: 'En attente',
            noDescription: 'Pas de description'
        },
        eligible: {
            noEligible: 'Aucun vendeur éligible',
            willAppearHere: 'Les vendeurs avec 1000+ ventes apparaîtront ici',
            info: '{{count}} vendeur(s) ont atteint 1000+ ventes et sont éligibles au statut Affilié (90% des revenus)'
        },
        searchPlaceholder: 'Rechercher un vendeur...',
        noSellersFound: 'Aucun vendeur trouvé',
        table: {
            seller: 'Vendeur',
            type: 'Type',
            products: 'Produits',
            sales: 'Ventes',
            revenue: 'Revenus',
            actions: 'Actions'
        },
        modal: {
            presentation: 'Présentation',
            noPresentation: 'Aucune présentation fournie.',
            portfolio: 'Portfolio & Travail',
            noPortfolioDescription: 'Aucune description du travail fournie.',
            experience: 'Expérience',
            socialNetworks: 'Réseaux sociaux',
            website: 'Site web',
            requestSentOn: 'Demande envoyée le',
            sellerTypeToAssign: 'Type de vendeur à attribuer',
            rejectRequest: 'Refuser la demande',
            rejectPlaceholder: 'Expliquez la raison du refus (qualité insuffisante, portfolio incomplet, etc.)...',
            confirmReject: 'Confirmer le refus'
        },
        success: {
            approved: 'Demande approuvée !',
            rejected: 'Demande refusée',
            typeUpdated: 'Type de vendeur mis à jour',
            promoted: 'Vendeur promu Affilié !'
        },
        errors: {
            reasonRequired: 'Veuillez entrer une raison',
            approveFailed: "Erreur lors de l'approbation",
            rejectFailed: 'Erreur lors du refus',
            updateFailed: 'Erreur lors de la mise à jour',
            promoteFailed: 'Erreur lors de la promotion'
        }
    },

    // Proposals (Admin)
    proposals: {
        title: 'Propositions vendeurs',
        subtitle: 'Gérez les propositions de catégories, tags et versions',
        types: {
            category: 'Catégorie',
            tag: 'Tag',
            version: 'Version',
            categories: 'Catégories',
            tags: 'Tags',
            versions: 'Versions'
        },
        status: {
            pending: 'En attente',
            approved: 'Approuvée',
            rejected: 'Refusée'
        },
        filters: {
            label: 'Filtres',
            allStatuses: 'Tous les statuts',
            allTypes: 'Tous les types'
        },
        actions: {
            approve: 'Approuver',
            reject: 'Refuser'
        },
        noProposals: 'Aucune proposition',
        noPendingProposals: 'Aucune proposition en attente de traitement',
        noProposalsWithCriteria: 'Aucune proposition avec ces critères',
        forGame: 'Pour',
        rejectionReason: 'Raison du refus',
        rejectModal: {
            title: 'Refuser la proposition',
            description: 'Refuser la proposition',
            reasonLabel: 'Raison du refus (optionnel)',
            reasonPlaceholder: 'Expliquez pourquoi cette proposition est refusée...'
        },
        success: {
            approved: 'Proposition approuvée et ajoutée !',
            rejected: 'Proposition refusée'
        },
        errors: {
            loadFailed: 'Erreur lors du chargement',
            approveFailed: "Erreur lors de l'approbation",
            rejectFailed: 'Erreur lors du refus'
        }
    },

    // Feedback (Admin)
    feedback: {
        title: 'Feedback & Signalements',
        tabs: {
            proposals: 'Propositions',
            reports: 'Signalements'
        },
        withSellerResponse: 'Avec réponse vendeur',
        types: {
            category: 'Catégorie',
            tag: 'Tag',
            version: 'Version',
            dependency: 'Dépendance'
        },
        reasons: {
            bug: 'Bug technique',
            error: 'Fichiers manquants',
            misleading: 'Description trompeuse',
            copyright: 'Violation de droits',
            inappropriate: 'Contenu inapproprié',
            other: 'Autre'
        },
        status: {
            pending: 'En attente',
            reviewed: 'En cours',
            resolved: 'Résolu',
            dismissed: 'Rejeté'
        },
        filters: {
            all: 'Tous'
        },
        actions: {
            approveAndCreate: 'Approuver et créer',
            reject: 'Refuser',
            resolved: 'Résolu',
            inProgress: 'En cours',
            unfounded: 'Non fondé'
        },
        proposals: {
            noProposals: 'Aucune proposition en attente',
            willAppearHere: 'Les propositions des vendeurs apparaîtront ici',
            by: 'Par',
            proposedOn: 'Proposée le',
            website: 'Site web'
        },
        reports: {
            noReports: 'Aucun signalement',
            willAppearHere: 'Les signalements de produits apparaîtront ici',
            sellerResponse: 'Réponse vendeur',
            seller: 'Vendeur',
            reportedBy: 'Signalé par',
            reportDescription: 'Description du signalement',
            sellerResponseOn: 'Réponse du vendeur ({{date}})',
            staffNote: 'Note du staff',
            viewProduct: 'Voir le produit'
        },
        modals: {
            rejectProposal: 'Refuser la proposition',
            rejectDepProposal: 'Refuser la proposition de dépendance',
            rejectReasonOptional: 'Raison du refus (optionnel)',
            rejectReasonPlaceholder: 'Expliquez pourquoi cette proposition est refusée...',
            rejectDepPlaceholder: 'Expliquez pourquoi cette dépendance est refusée...',
            markResolved: '✓ Marquer comme résolu',
            markUnfounded: '✗ Marquer comme non fondé',
            product: 'Produit',
            reason: 'Raison',
            staffNoteOptional: 'Note pour le vendeur (optionnel)',
            staffNotePlaceholder: 'Ajoutez une note explicative pour le vendeur...',
            staffNoteHint: 'Cette note sera visible par le vendeur dans sa notification.',
            confirm: 'Confirmer'
        },
        success: {
            proposalApproved: 'Proposition approuvée et créée !',
            proposalRejected: 'Proposition rejetée',
            reportUpdated: 'Signalement mis à jour',
            depApproved: 'Dépendance approuvée et créée !',
            depRejected: 'Proposition de dépendance rejetée'
        },
        errors: {
            generic: 'Erreur',
            rejectFailed: 'Erreur lors du rejet'
        }
    },

    // Dependencies (Admin)
    dependencies: {
        title: 'Dépendances',
        subtitle: 'Gérez les dépendances disponibles pour les produits',
        tabs: {
            dependencies: 'Dépendances',
            proposals: 'Propositions'
        },
        filters: {
            allGames: 'Tous les jeux',
            allStatuses: 'Tous les statuts'
        },
        status: {
            pending: 'En attente',
            approved: 'Approuvée',
            rejected: 'Refusée'
        },
        newDependency: 'Nouvelle dépendance',
        noDependencies: 'Aucune dépendance',
        noProposals: 'Aucune proposition',
        disabled: 'Désactivée',
        usedBy: 'Utilisée par {{count}} produit(s)',
        proposedBy: 'Proposée par',
        reason: 'Raison',
        confirmDelete: 'Supprimer cette dépendance ? Les produits liés perdront cette association.',
        rejectReasonPrompt: 'Raison du refus (optionnel):',
        actions: {
            approve: 'Approuver',
            reject: 'Refuser'
        },
        modal: {
            createTitle: 'Nouvelle dépendance',
            editTitle: 'Modifier la dépendance',
            logo: 'Logo',
            clickToUpload: 'Cliquez pour uploader',
            logoFormats: 'PNG, JPG, SVG (max 2MB)',
            name: 'Nom',
            namePlaceholder: 'Ex: Fabric, Forge, OptiFine...',
            game: 'Jeu',
            selectGame: 'Sélectionner un jeu',
            description: 'Description',
            descriptionPlaceholder: 'Description courte...',
            website: 'Site web',
            create: 'Créer',
            update: 'Mettre à jour'
        },
        success: {
            created: 'Dépendance créée',
            updated: 'Dépendance mise à jour',
            deleted: 'Dépendance supprimée',
            proposalApproved: 'Proposition approuvée',
            proposalRejected: 'Proposition refusée'
        },
        errors: {
            loadFailed: 'Erreur de chargement',
            logoTooLarge: 'Logo trop volumineux (max 2MB)',
            nameRequired: 'Nom requis',
            gameRequired: 'Jeu requis',
            generic: 'Erreur'
        }
    },

    // Custom Orders (Admin)
    customOrdersAdmin: {
        title: 'Commandes sur mesure',
        status: {
            pending: 'En attente',
            approved: 'Approuvée',
            assigned: 'Assignée',
            inProgress: 'En cours',
            completed: 'Terminée',
            cancelled: 'Annulée',
            rejected: 'Refusée'
        },
        orderStatus: {
            awaitingPayment: 'Attente paiement',
            inProgress: 'En cours',
            awaitingFinal: 'Attente solde',
            completed: 'Terminée',
            cancelled: 'Annulée',
            disputed: 'Litige'
        },
        stats: {
            pending: 'En attente',
            creators: 'Créateurs',
            inProgress: 'En cours',
            commissions: 'Commissions'
        },
        tabs: {
            requests: 'Demandes',
            creators: 'Créateurs affiliés',
            orders: 'Commandes'
        },
        filters: {
            all: 'Toutes'
        },
        actions: {
            approve: 'Approuver',
            reject: 'Refuser'
        },
        requests: {
            noRequests: 'Aucune demande',
            noRequestsWithStatus: 'Aucune demande avec le statut "{{status}}"',
            noRequestsInSystem: 'Aucune demande dans le système',
            by: 'Par',
            offersCount: '{{count}} offre(s)',
            description: 'Description',
            game: 'Jeu',
            category: 'Catégorie',
            budget: 'Budget',
            deadline: 'Deadline',
            createdAt: 'Créée le'
        },
        rejectModal: {
            title: 'Refuser la demande',
            placeholder: 'Raison du refus...'
        },
        creators: {
            affiliated: 'Affilié',
            info: 'Les créateurs <strong>Affiliés</strong> et <strong>HytStudio</strong> peuvent recevoir des demandes sur mesure. Gérez leurs types dans l\'onglet <strong>"Vendeurs actifs"</strong> de la page Vendeurs.',
            noCreators: 'Aucun créateur affilié',
            promoteHint: 'Promouvez des vendeurs en "Affilié" ou "HytStudio" dans la gestion des vendeurs',
            products: 'Produits',
            sales: 'Ventes',
            revenue: 'Revenus'
        },
        orders: {
            noOrders: 'Aucune commande',
            commission: 'Commission',
            table: {
                order: 'Commande',
                client: 'Client',
                creator: 'Créateur',
                price: 'Prix',
                status: 'Statut',
                date: 'Date'
            }
        },
        success: {
            approved: 'Demande approuvée',
            rejected: 'Demande refusée'
        },
        errors: {
            loadFailed: 'Erreur lors du chargement',
            approveFailed: "Erreur lors de l'approbation",
            rejectFailed: 'Erreur lors du refus',
            reasonRequired: 'Veuillez entrer une raison'
        }
    },

    // Analytics
    analytics: {
        title: 'Analytics',
        subtitle: 'Statistiques détaillées de la plateforme',
        filters: {
            label: 'Filtres',
            last7days: '7 derniers jours',
            last30days: '30 derniers jours',
            last90days: '90 derniers jours',
            thisYear: 'Cette année',
            allGames: 'Tous les jeux',
            clearFilter: 'Effacer filtre'
        },
        filteredFor: 'Statistiques filtrées pour',
        selectedGame: 'Jeu sélectionné',
        noData: 'Aucune donnée',
        sales: 'ventes',
        products: 'produits',
        views: 'vues',
        kpis: {
            totalRevenue: 'Revenus totaux',
            salesCount: '{{count}} ventes',
            avgCart: 'Panier moyen',
            perTransaction: 'Par transaction',
            totalViews: 'Vues totales',
            uniqueVisitors: '{{count}} visiteurs uniques',
            conversionRate: 'Taux conversion',
            visitorsToBuyers: 'Visiteurs → Acheteurs'
        },
        gameDetails: {
            title: 'Détails pour',
            topCategories: 'Catégories les plus vendues',
            topTags: 'Tags les plus populaires',
            topVersions: 'Versions les plus vendues',
            forThisGame: 'Pour ce jeu',
            bestSellers: 'Produits best-sellers',
            top10For: 'Top 10 pour {{game}}'
        },
        charts: {
            salesByGame: 'Ventes par jeu',
            salesDistribution: 'Répartition des ventes',
            salesByCategory: 'Ventes par catégorie',
            byProductType: 'Répartition par type de produit',
            salesEvolution: 'Évolution des ventes',
            salesAndRevenue: 'Ventes et revenus sur la période',
            salesLabel: 'Ventes',
            revenueLabel: 'Revenus (€)',
            priceDistribution: 'Distribution des prix',
            salesByPriceRange: 'Répartition des ventes par tranche de prix',
            salesCount: 'Nombre de ventes',
            popularTags: 'Tags les plus populaires',
            bestSellingTags: 'Tags les plus vendus',
            mostViewedProducts: 'Produits les plus consultés',
            topProductsBySales: 'Top produits par ventes',
            conversionFunnel: 'Entonnoir de conversion',
            userJourney: 'Parcours utilisateur'
        }
    },

    // Admin
    admin: {
        sidebar: {
            title: 'Administration'
        },
        nav: {
            dashboard: 'Dashboard',
            pending: 'En attente',
            analytics: 'Analytics',
            users: 'Utilisateurs',
            sellers: 'Vendeurs',
            products: 'Produits',
            customOrders: 'Sur mesure',
            feedback: 'Feedback',
            settings: 'Paramètres'
        },
        overview: {
            title: "Vue d'ensemble"
        },
        stats: {
            vsLastMonth: 'vs mois dernier',
            totalRevenue: 'Revenus totaux',
            platformCommission: 'Commission plateforme',
            sales: 'Ventes',
            activeSellers: 'Vendeurs actifs',
            visits: 'Visites',
            downloads: 'Téléchargements',
            avgTime: 'Temps moyen',
            reports: 'Signalements',
            customOrders: 'Sur mesure',
            totalReports: 'Total signalés'
        },
        alerts: {
            pendingReports: '{{count}} signalement(s) en attente',
            reportsNeedAttention: 'Des produits ont été signalés et nécessitent votre attention',
            viewReports: 'Voir les signalements',
            pendingCustomOrders: '{{count}} demande(s) sur mesure en attente',
            customOrdersNeedValidation: 'Des clients attendent la validation de leur demande',
            viewRequests: 'Voir les demandes'
        },
        quickActions: {
            title: 'Actions rapides',
            pendingProducts: 'Produits en attente',
            users: 'Utilisateurs',
            customOrders: 'Sur mesure',
            sellers: 'Vendeurs'
        },
        reportsSection: {
            title: 'Signalements',
            viewAll: 'Voir tout',
            noReports: 'Aucun signalement',
            pending: 'En attente',
            underReview: "En cours d'examen",
            processed: 'Total traités'
        },
        pending: {
            title: 'Produits en attente',
            noPending: 'Aucun produit en attente',
            allProcessed: 'Tous les produits ont été traités',
            badges: {
                corrected: 'Corrigé',
                modified: 'Modifié',
                new: 'Nouveau'
            },
            modifs: 'modif(s)',
            modificationsPreview: 'Aperçu des modifications',
            viewAll: 'Voir tout',
            descriptionModified: 'Description modifiée',
            previousHiddenReason: 'Ancienne raison du masquage',
            viewModifications: 'Voir les modifications'
        },
        modifications: {
            before: 'Avant',
            after: 'Après',
            empty: '(vide)',
            none: '(aucune)',
            changed: 'Changé',
            detailTitle: 'Détail des modifications',
            newProduct: 'Nouveau produit - Pas de modifications',
            changesDetected: '{{count}} modification(s) détectée(s)',
            previousHiddenReason: 'Raison du masquage précédent',
            fields: {
                title: 'Titre',
                description: 'Description',
                price: 'Prix',
                game: 'Jeu',
                category: 'Catégorie'
            }
        },
        users: {
            title: 'Gestion des utilisateurs',
            searchPlaceholder: 'Rechercher un utilisateur...',
            allRoles: 'Tous les rôles',
            table: {
                user: 'Utilisateur',
                email: 'Email',
                role: 'Rôle',
                registered: 'Inscription',
                actions: 'Actions'
            },
            ban: 'Bannir',
            unban: 'Débannir',
            success: {
                banned: 'Utilisateur banni',
                unbanned: 'Utilisateur débanni',
                roleChanged: 'Rôle modifié'
            },
            errors: {
                banFailed: 'Erreur',
                roleChangeFailed: 'Erreur lors du changement de rôle'
            }
        },
        products: {
            title: 'Gestion des produits',
            count: '{{count}} produit(s)',
            searchPlaceholder: 'Rechercher par titre ou créateur...',
            allStatuses: 'Tous les statuts',
            noProducts: 'Aucun produit trouvé',
            tryOtherTerms: "Essayez avec d'autres termes",
            noProductsInDb: 'Aucun produit dans la base de données',
            by: 'Par',
            unknown: 'Inconnu',
            reason: 'Raison',
            view: 'Voir',
            approve: 'Approuver',
            reject: 'Rejeter',
            hide: 'Masquer',
            unhide: 'Réafficher',
            delete: 'Supprimer',
            status: {
                approved: 'Approuvé',
                pending: 'En attente',
                rejected: 'Rejeté',
                hidden: 'Masqué'
            },
            hideModal: {
                title: 'Masquer le produit',
                description: 'Vous allez masquer "{{title}}". Le vendeur sera notifié de la raison.',
                reasonLabel: 'Raison du masquage',
                reasonPlaceholder: 'Ex: Contenu inapproprié, droits d\'auteur, qualité insuffisante...'
            },
            deleteModal: {
                title: 'Supprimer le produit',
                description: 'Êtes-vous sûr de vouloir supprimer définitivement "{{title}}" ? Cette action est irréversible.'
            },
            success: {
                approved: 'Produit approuvé',
                rejected: 'Produit rejeté',
                hidden: 'Produit masqué - Le vendeur sera notifié',
                unhidden: 'Produit réaffiché',
                deleted: 'Produit supprimé'
            },
            errors: {
                approveFailed: "Erreur lors de l'approbation",
                rejectFailed: 'Erreur lors du rejet',
                reasonRequired: 'Veuillez entrer une raison',
                hideFailed: 'Erreur lors du masquage',
                unhideFailed: 'Erreur lors du réaffichage',
                deleteFailed: 'Erreur lors de la suppression'
            }
        }
    },

    // Bundles
    bundles: {
        title: 'Mes Bundles',
        subtitle: 'Créez des offres groupées pour augmenter vos ventes',
        createBundle: 'Créer un bundle',
        confirmDelete: 'Supprimer ce bundle ?',
        stats: '{{products}} produits • {{sales}} ventes',
        status: {
            active: 'Actif',
            inactive: 'Inactif'
        },
        empty: {
            title: 'Aucun bundle',
            description: 'Créez votre premier bundle pour proposer des offres groupées à vos clients',
            cta: 'Créer mon premier bundle'
        },
        actions: {
            activate: 'Activer',
            deactivate: 'Désactiver',
            edit: 'Modifier',
            delete: 'Supprimer'
        },
        modal: {
            createTitle: 'Créer un bundle',
            editTitle: 'Modifier le bundle'
        },
        form: {
            titleLabel: 'Titre du bundle',
            titlePlaceholder: 'Ex: Pack Complet Véhicules',
            descriptionLabel: 'Description',
            descriptionPlaceholder: 'Décrivez votre bundle...',
            discountTypeLabel: 'Type de remise',
            discountPercent: 'Pourcentage',
            discountFixed: 'Montant fixe',
            discountValueLabel: 'Valeur de la remise',
            productsLabel: 'Produits inclus (minimum 2)',
            searchPlaceholder: 'Rechercher un produit...',
            noProducts: 'Aucun produit approuvé trouvé',
            selectedCount: '{{count}} produit(s) sélectionné(s)',
            startDate: 'Date de début (optionnel)',
            endDate: 'Date de fin (optionnel)',
            create: 'Créer le bundle',
            update: 'Modifier'
        },
        preview: {
            originalPrice: 'Prix original',
            savings: 'Économie',
            finalPrice: 'Prix final',
            minPriceWarning: 'Le prix minimum est de 5€. Réduisez la remise.'
        },
        success: {
            created: 'Bundle créé',
            updated: 'Bundle modifié',
            deleted: 'Bundle supprimé',
            activated: 'Bundle activé',
            deactivated: 'Bundle désactivé'
        },
        errors: {
            loadFailed: 'Erreur lors du chargement des bundles',
            minProducts: 'Sélectionnez au moins 2 produits',
            minPrice: 'Le prix final ({{price}}€) est inférieur au minimum de 5€',
            deleteFailed: 'Erreur lors de la suppression',
            generic: 'Erreur'
        }
    },

    // Modals
    modals: {
        confirm: 'Confirmer',
        send: 'Envoyer',
        minCharsLabel: 'caractères minimum',
        errors: {
            fieldRequired: 'Ce champ est requis',
            minChars: 'Minimum {{count}} caractères requis'
        },
        withdraw: {
            title: 'Se rétracter',
            subtitle: 'Cette action est irréversible',
            depositPaid: 'Acompte payé',
            youGet: 'Vous récupérez (25%)',
            creatorGets: 'Créateur reçoit (20%)',
            platformFee: 'Frais plateforme (5%)',
            reasonLabel: 'Raison de la rétractation (optionnel)',
            reasonPlaceholder: 'Expliquez pourquoi vous souhaitez annuler...',
            confirm: 'Confirmer la rétractation'
        },
        claim: {
            title: 'Signaler un problème',
            subtitle: 'Le créateur et notre équipe seront notifiés',
            info: 'Si les fichiers ne fonctionnent pas correctement, décrivez précisément le problème. Le créateur pourra vous envoyer une version corrigée.',
            describeLabel: 'Décrivez le problème rencontré',
            describePlaceholder: "Ex: Le fichier ne s'ouvre pas, il manque des textures, les dimensions ne correspondent pas...",
            errorMinChars: 'Veuillez décrire le problème plus en détail (min 20 caractères)',
            submit: 'Envoyer la réclamation'
        },
        revision: {
            title: 'Demander des révisions',
            subtitle: 'Le créateur sera notifié',
            whatChanges: 'Quelles modifications souhaitez-vous ?',
            placeholder: 'Décrivez précisément les changements que vous aimeriez voir...',
            errorRequired: 'Veuillez décrire les modifications souhaitées',
            submit: 'Envoyer la demande'
        },
        delivery: {
            title: 'Confirmer la livraison ?',
            message: 'Vous allez livrer {{count}} fichier(s)',
            info: 'Le client pourra ensuite valider ou demander des modifications.',
            deliver: 'Livrer'
        },
        approveDelivery: {
            title: 'Valider la livraison ?',
            message: 'En validant, vous confirmez que le travail correspond à vos attentes.',
            nextStep: 'Prochaine étape : paiement du solde',
            validate: 'Valider'
        },
        rejectFix: {
            title: 'Refuser le correctif',
            version: 'Version {{version}}',
            info: 'Expliquez précisément ce qui ne fonctionne pas pour que le créateur puisse corriger efficacement.',
            whatWrong: "Qu'est-ce qui ne va pas ?",
            placeholder: "Ex: Le fichier ne s'ouvre toujours pas, les couleurs ne correspondent pas à ma demande, il manque encore...",
            errorRequired: 'Veuillez expliquer pourquoi le correctif ne convient pas',
            submit: 'Refuser et envoyer'
        },
        acceptFix: {
            title: 'Accepter le correctif ?',
            version: 'Version {{version}}',
            info: 'En acceptant, la réclamation sera clôturée et les fichiers corrigés remplaceront les fichiers finaux.',
            downloadInfo: 'Vous pourrez télécharger les fichiers corrigés une fois le paiement effectué',
            accept: 'Accepter'
        }
    },

    // Report Modal
    report: {
        title: 'Signaler un problème',
        problemType: 'Type de problème',
        descriptionLabel: 'Description du problème',
        descriptionPlaceholder: 'Décrivez le problème en détail...',
        descriptionHint: 'Plus vous donnez de détails, plus vite le problème pourra être résolu.',
        optional: '(optionnel)',
        note: 'Note',
        notPurchasedInfo: "Vous n'avez pas encore acheté ce produit. Seuls les signalements concernant les éléments visibles sont disponibles.",
        infoNote: "Le vendeur et l'équipe de modération seront notifiés de votre signalement. Nous vous contacterons si nous avons besoin de plus d'informations.",
        submit: 'Envoyer le signalement',
        success: 'Signalement envoyé ! Le staff et le vendeur ont été notifiés.',
        reasons: {
            copyright: 'Vol de contenu',
            copyrightDesc: 'Le produit utilise du contenu volé ou protégé',
            copyrightDescPost: 'Le produit utilise du contenu volé ou protégé',
            misleading: 'Description trompeuse',
            misleadingDesc: 'Le titre ou la description est mensonger',
            misleadingDescPost: 'Le produit ne correspond pas à la description',
            inappropriate: 'Contenu inapproprié',
            inappropriateDesc: 'Images ou texte offensant/inapproprié',
            inappropriateDescPost: 'Le produit contient du contenu offensant',
            bug: 'Bug / Erreur technique',
            bugDesc: 'Le produit ne fonctionne pas correctement',
            error: 'Fichiers manquants / corrompus',
            errorDesc: 'Des fichiers sont absents ou endommagés',
            other: 'Autre raison',
            otherDesc: 'Précisez dans la description'
        },
        errors: {
            noReason: 'Veuillez sélectionner une raison',
            noDescription: 'Veuillez décrire le problème',
            generic: 'Erreur lors du signalement'
        }
    },

    // ModelCard
    modelCard: {
        viewShop: 'Voir la boutique de {{name}}'
    },

    // Footer
    footer: {
        description: 'La marketplace gaming de référence pour vos modèles 3D, textures, plugins et plus encore.',
        sections: {
            platform: 'Plateforme',
            support: 'Support',
            legal: 'Légal'
        },
        links: {
            products: 'Produits',
            games: 'Jeux',
            becomeCreator: 'Devenir créateur',
            faq: 'FAQ',
            contact: 'Contact',
            help: 'Aide',
            terms: 'CGU',
            privacy: 'Confidentialité',
            cookies: 'Cookies'
        },
        allRightsReserved: 'Tous droits réservés.',
        madeWith: 'Fait avec',
        inFrance: 'en France'
    },

    // Navigation
    nav: {
        products: 'Produits',
        customOrders: 'Sur mesure',
        upload: 'Upload',
        notifications: 'Notifications',
        markAllRead: 'Tout marquer lu',
        noNotifications: 'Aucune notification',
        view: 'Voir',
        markAsRead: 'Marquer comme lu',
        delete: 'Supprimer',
        viewAllNotifications: 'Voir toutes les notifications',
        myProfile: 'Mon profil',
        dashboard: 'Dashboard',
        myShop: 'Ma boutique',
        becomeCreator: 'Devenir créateur',
        myPurchases: 'Mes achats',
        invoices: 'Factures',
        administration: 'Administration',
        logout: 'Déconnexion',
        login: 'Connexion',
        register: 'Inscription',
        cart: 'Panier',
        language: 'Langue',
        timeAgo: {
            now: "À l'instant",
            minutes: 'Il y a {{count}}m',
            hours: 'Il y a {{count}}h',
            days: 'Il y a {{count}}j'
        }
    }
}