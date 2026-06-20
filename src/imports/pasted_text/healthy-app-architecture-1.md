ARCHITECTURE FRONTEND DE HELTHY PAGE (Version Pro)
Ton application comporte 3 grands fronts :
1.	App Mobile Patient (Flutter ou React Native) 
2.	App Mobile / Web Professionnels de santé 
3.	Dashboard Web : Admin – Assurances – Établissements 
Ci-dessous tu as la structure complète, dossier par dossier, page par page, composant par composant.
________________________________________
I. STRUCTURE GLOBALE DU FRONTEND
📁 src/
src/
 ├── assets/
 ├── components/
 ├── hooks/
 ├── layouts/
 ├── navigation/
 ├── screens/
 ├── services/
 ├── store/
 ├── utils/
 └── App.js
________________________________________
II. DÉTAIL PAR MODULE FRONTEND
________________________________________
1️⃣ APP MOBILE PATIENT – HELTHY PAGE
📁 navigation/
navigation/
 ├── AuthNavigator.js
 ├── MainNavigator.js
 ├── TabNavigator.js
 └── RootNavigator.js
________________________________________
🏠 A. Module Accueil
📁 screens/home/
•	HomeScreen 
•	NotificationsScreen 
•	ConseilsPersonnalisesScreen (IA) 
•	AlertesMedicalesScreen 
________________________________________
🧍‍♂️ B. Module Patient / Profil
📁 screens/profile/
•	MonProfilScreen 
•	ParametresScreen 
•	CarnetSanteScreen (numérisé) 
•	HistoriqueSoinsScreen 
•	MesRessentisScreen (symptômes) 
(lié au livret physique du carnet, texte du fichier)
________________________________________
🗓 C. Module Rendez-vous / Orientation
📁 screens/rendezvous/
•	RechercheCentreScreen 
•	FicheCentreScreen 
•	ChoixSpecialisteScreen 
•	CalendrierScreen 
•	ConfirmationRDVScreen 
•	MesRDVScreen 
(inclut géolocalisation et classement des centres)
________________________________________
🧪 D. Module Examens & Analyses
📁 screens/examens/
•	ListeExamensScreen 
•	ResultatDetailScreen 
•	GraphiquesEvolutionScreen 
•	ConsignesPreExamensScreen 
(avec notifications automatiques)
________________________________________
💬 E. Module Téléconsultation & Chat médical
📁 screens/chat/
•	ChatMedicalScreen 
•	TeleconsultationScreen 
•	EnvoiDocumentsScreen 
________________________________________
💊 F. Module Médicaments / Ordonnances
📁 screens/ordonnances/
•	MesOrdonnancesScreen 
•	PosologieDetailScreen 
•	TraitementsEnCoursScreen 
•	RenouvellementOrdonnanceScreen 
________________________________________
🧘 G. Module Bien-être & Psychologie
📁 screens/bienetre/
•	NutritionScreen 
•	SommeilScreen 
•	ActivitePhysiqueScreen 
•	GestionStressScreen 
•	ExercicesRespirationScreen 
•	YogaScreen 
________________________________________
📁 H. Module Assistance Logistique
📁 screens/assistance/
•	AssistanceVestimentaireScreen 
•	EntretienLingeScreen 
•	AccompagnementMobiliteScreen 
•	ActivitesLudiquesScreen 
•	AteliersCreatifsScreen 
(tiré des modules de services complémentaires)
________________________________________
2️⃣ APP / WEB PROFESSIONNELS DE SANTÉ
📁 screens/pro/
•	DashboardProScreen 
•	ListePatientsScreen 
•	DossierPatientScreen 
•	ConsultationAjoutScreen 
•	OrdonnanceCreationScreen 
•	CalendrierConsultationsScreen 
•	StatistiquesPatienteleScreen 
•	PharmacopéeTraditionnelleScreen (depuis le fichier) 
________________________________________
3️⃣ DASHBOARD WEB (Admin, Assurances, Établissements)
📁 screens/admin/
•	AdminDashboard 
•	GestionPatientsScreen 
•	GestionProfessionnelsScreen 
•	GestionEtablissementsScreen 
•	GestionAssurancesScreen 
•	LogsEtAuditScreen 
•	ParametresGlobauxScreen 
•	NotificationsSystemeScreen 
📁 screens/assurance/
•	DashboardAssurance 
•	DossiersEnAttente 
•	DocumentsPatient 
•	SuiviRemboursements 
📁 screens/etablissement/
•	DashboardEtablissement 
•	FluxPatients 
•	HistoriqueSoins 
•	SynchronisationDossier 
________________________________________
IV. ARCHITECTURE DES COMPOSANTS
📁 components/
components/
 ├── ui/
 │     ├── Button.js
 │     ├── Card.js
 │     ├── Input.js
 │     ├── Loader.js
 │     └── Modal.js
 │
 ├── medical/
 │     ├── DossierCard.js
 │     ├── OrdonnanceItem.js
 │     ├── AnalyseGraph.js
 │     └── SymptomeTag.js
 │
 ├── rendezvous/
 │     ├── CentreItem.js
 │     ├── SpecialisteItem.js
 │     └── Calendrier.js
 │
 ├── chat/
 │     ├── MessageBubble.js
 │     └── FileUploader.js
 │
 └── navigation/
       └── TabBar.js
________________________________________
V. LAYOUTS
📁 layouts/
•	MainLayout 
•	AuthLayout 
•	DashboardLayout 
•	ConsultationLayout 
________________________________________
VI. GESTION D’ÉTAT
📁 store/ (Zustand, Redux Toolkit)
store/
 ├── userStore.js
 ├── patientStore.js
 ├── rdvStore.js
 ├── examensStore.js
 ├── chatStore.js
 ├── notificationStore.js
 └── uiStore.js
________________________________________
VII. UTILS & SERVICES
📁 services/
•	api.js 
•	authService.js 
•	patientService.js 
•	rdvService.js 
•	orientationService.js 
•	chatService.js 
•	paiementService.js 
•	notificationsService.js 
📁 utils/
•	formatDate.js 
•	secureStorage.js 
•	validation.js 
•	geoUtils.js 
________________________________________
VIII. THÈME & DESIGN SYSTEM
📁 theme/
•	colors.js 
•	typography.js 
•	spacing.js 
•	shadows.js 
•	components.js 
 
1) PARCOURS UTILISATEUR PATIENT — HELTHY PAGE (APP MOBILE)
🧩 ÉTAPE 1 — Onboarding
Objectif : Comprendre l’app et rassurer.
Écrans :
1.	Bienvenue 
2.	Présentation de la mission (“Votre compagnon de santé”) 
3.	Avantages clés : 
o	Suivi santé 
o	Carnet numérique 
o	Orientation médicale 
o	Téléconsultation 
o	Notifications & bien-être 
4.	Sélection langue 
5.	Accès au bouton “Créer mon compte” 
________________________________________
🧩 ÉTAPE 2 — Création de compte
Écrans :
•	Téléphone + OTP 
•	Infos personnelles : 
o	Nom 
o	Date de naissance 
o	Sexe 
o	Adresse 
o	Contact d’urgence 
o	Groupe sanguin (optionnel) 
•	Photo ou scan du QR Code du Carnet Santé (si existant) 
⚡ Résultat :
L’utilisateur est immédiatement connecté à son Dossier Patient Numérique.
________________________________________
🧩 ÉTAPE 3 — Tableau de bord (Home)
L’utilisateur voit :
•	Son état du jour (bien-être pondéré) 
•	Rappels médicaux (vaccins, examens, traitements) 
•	Prochain RDV 
•	Conseils santé personnalisés (IA) 
•	Bouton “Rechercher un centre médical” 
•	Alertes importantes 
👉 Toute la suite du parcours part de cet écran.
________________________________________
🧩 ÉTAPE 4 — Saisie des ressentis / symptômes
Écran : "Comment vous sentez-vous aujourd'hui ?"
•	Stress 
•	Sommeil 
•	Douleurs 
•	Nutrition 
•	Hydratation 
•	Humeur 
⚡ IA : propose
•	auto-évaluation 
•	signaux d’alerte 
•	orientation vers un pro si nécessaire 
________________________________________
🧩 ÉTAPE 5 — Prise de rendez-vous / Orientation
Flow UX :
1.	L’utilisateur clique : “Trouver un centre / spécialiste” 
2.	L’app ouvre une carte interactive 
3.	Filtrage : 
o	Généraliste 
o	Pédiatre 
o	Cardiologue 
o	Laboratoire 
o	Urgences 
o	Hôpital 
4.	Classement IA : 
o	proximité 
o	disponibilité 
o	spécialisation 
o	qualité du service 
5.	Choix du médecin / centre 
6.	Choix horaire 
7.	Confirmation + ajout au calendrier 
________________________________________
🧩 ÉTAPE 6 — Consultation / Hospitalisation
Le patient reçoit :
•	Feuille de route (adresse, itinéraire) 
•	Dossier préparé (allergies, antécédents, examens) 
•	Notifications avant RDV 
Après la consultation :
•	Le professionnel met à jour le dossier 
•	Le patient reçoit : 
o	ordonnance 
o	compte rendu 
o	examens à faire 
o	rappel traitement 
________________________________________
🧩 ÉTAPE 7 — Résultats d’analyses
Écrans :
•	Liste des examens 
•	Résultat détaillé 
•	Graphique d'évolution 
•	Commentaire médical en langage simple 
•	Conseils 
•	Prochain contrôle 
Rappels automatiques intégrés.
________________________________________
🧩 ÉTAPE 8 — Suivi des traitements
UX simple :
•	Une carte par médicament 
•	Horaires + sonnerie 
•	Validation quotidienne (“pris / oublié”) 
•	Effets ressentis 
•	Renouvellement ordonnance → clic 
________________________________________
🧩 ÉTAPE 9 — Bien-être & programmes d'accompagnement
Écrans :
•	Nutrition 
•	Activités physiques 
•	Suivi du sommeil 
•	Gestion du stress 
•	Yoga / respiration 
•	Conseils personnalisés 
________________________________________
🧩 ÉTAPE 10 — Assistance logistique
Écrans dédiés (en cohérence avec ton dossier) :
•	Demande de linge 
•	Assistance vestimentaire 
•	Accompagnement mobilité réduite 
•	Activités créatives / pédagogiques 
•	Soutien psychologique 
Chaque demande génère :
•	une notification au centre de santé 
•	un suivi en temps réel 
________________________________________
🧩 ÉTAPE 11 — Assurances & remboursements
UX simplifiée :
1.	Dépôt d’une pièce (photo) 
2.	Vérification automatique 
3.	Suivi en temps réel 
4.	Notification “remboursé” 
________________________________________
🧩 ÉTAPE 12 — Profil
•	Informations personnelles 
•	Synchronisation carnet physique ↔ carnet numérique 
•	Contacts d’urgence 
•	Historique complet 
•	Export PDF 
•	Paramètres 
________________________________________
🟦 2) PARCOURS UTILISATEUR — PROFESSIONNEL DE SANTÉ
🧩 ÉTAPE 1 — Connexion sécurisée
•	Mot de passe ou OTP 
•	Rôle : Médecin, infirmier, spécialiste 
________________________________________
🧩 ÉTAPE 2 — Tableau de bord
•	Consultations du jour 
•	Liste des patients 
•	Alertes urgentes 
•	Messages / téléconsultations 
•	Statistiques patientèle 
________________________________________
🧩 ÉTAPE 3 — Dossier patient
•	Historique médical 
•	Carnet santé 
•	Derniers examens 
•	Observations / ressentis du patient 
•	Traitements en cours 
________________________________________
🧩 ÉTAPE 4 — Consultation
Le pro peut :
•	Ajouter un diagnostic 
•	Mettre à jour le dossier 
•	Prescrire une ordonnance 
•	Ajouter une note 
•	Demander examens complémentaires 
________________________________________
🧩 ÉTAPE 5 — Téléconsultation
•	Chat médical 
•	Envoi de documents 
•	Photos de plaies 
•	Recommandations 
•	Orientation prochaine étape 
________________________________________
🧩 ÉTAPE 6 — Module spécial “Pharmacopée traditionnelle encadrée”
Fonctionnel (depuis ton doc) :
•	Consultation des préparations validées 
•	Vérification interactions 
•	Conseils d’utilisation 
________________________________________
🧩 ÉTAPE 7 — Statistiques
•	Nombre de consultations 
•	Taux de suivi 
•	Pathologies fréquentes 
•	Satisfaction patient 
________________________________________
🟦 3) PARCOURS UTILISATEUR — ÉTABLISSEMENT / ASSURANCE (WEB)
🏥 Établissement
•	Tableau flux patients 
•	Mise à jour dossiers 
•	Intégration résultats examens 
•	Historique hospitalisations 
•	Planning du personnel 
🛡 Assurance
•	Liste dossiers 
•	Documents reçus 
•	Demandes en cours 
•	Remboursements 
•	Statistiques

