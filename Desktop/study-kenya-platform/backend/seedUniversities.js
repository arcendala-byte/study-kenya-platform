require('dotenv').config();
const supabase = require('./supabaseClient');

// I noticed you have many university images in your public/images folder
// Let's add all of them with proper data

const universitiesData = [
  // ============ PUBLIC UNIVERSITIES ============
  {
    name: "University of Nairobi",
    slug: "university-of-nairobi",
    location: "Nairobi, Kenya",
    type: "public",
    description: "La plus grande et plus prestigieuse université publique du Kenya, l'Université de Nairobi possède une riche histoire académique et offre le plus grand nombre de programmes dans le pays. Située en plein cœur du quartier des affaires de Nairobi, elle est un centre d'innovation, de recherche médicale et d'excellence en ingénierie.",
    programs: ["Médecine", "Ingénierie", "Droit", "Commerce", "Arts", "Sciences"],
    courses: [
      "Médecine et Chirurgie",
      "Ingénierie Civile et Électrique",
      "Architecture",
      "Économie",
      "Sciences Politiques",
      "Droit",
      "Commerce"
    ],
    requirements: [
      "Diplôme d'État avec d'excellents résultats (spécialement en sciences pour la médecine).",
      "Soumission via le portail des étudiants internationaux.",
      "Certificat médical complet."
    ],
    fees: "$2,500 - $5,000 par an",
    categories: ["Médecine", "Ingénierie", "Recherche", "Droit"],
    image: "/images/University_of_nairobi.jpg",
    featured: true,
    website: "https://www.uonbi.ac.ke"
  },
  {
    name: "Kenyatta University",
    slug: "kenyatta-university",
    location: "Nairobi, Kenya",
    type: "public",
    description: "L'une des principales universités publiques du Kenya, réputée pour sa solide culture de recherche et son excellence académique. Propose des programmes en sciences de la santé, éducation, ingénierie et sciences humaines.",
    programs: ["Éducation", "Sciences de la Santé", "Ingénierie", "Commerce", "Arts"],
    courses: [
      "Baccalauréat en Éducation",
      "Sciences Infirmières",
      "Ingénierie",
      "Commerce",
      "Arts"
    ],
    requirements: [
      "Diplôme d'État avec une moyenne minimale de C+ au KCSE (ou équivalent).",
      "Preuve de maîtrise de l'anglais.",
      "Formulaire de candidature dûment rempli."
    ],
    fees: "$2,000 - $3,500 par an",
    categories: ["Éducation", "Recherche", "Sciences de la Santé"],
    image: "/images/Kenyata_university.jpeg",
    featured: true,
    website: "https://www.ku.ac.ke"
  },
  {
    name: "Moi University",
    slug: "moi-university",
    location: "Eldoret, Kenya",
    type: "public",
    description: "Université publique de premier plan à Eldoret, offrant des programmes diversifiés en médecine, ingénierie, commerce et sciences humaines. Réputée pour son école de médecine et ses initiatives de recherche.",
    programs: ["Médecine", "Ingénierie", "Commerce", "Sciences Humaines", "Agriculture"],
    courses: [
      "Médecine et Chirurgie",
      "Ingénierie",
      "Commerce",
      "Sciences Humaines",
      "Agriculture"
    ],
    requirements: [
      "Diplôme d'État avec de bons résultats en sciences.",
      "Examen d'entrée pour certaines filières.",
      "Lettre de motivation."
    ],
    fees: "$1,800 - $3,500 par an",
    categories: ["Médecine", "Ingénierie", "Recherche"],
    image: "/images/moi-university.jpeg",
    featured: false,
    website: "https://www.mu.ac.ke"
  },
  {
    name: "Egerton University",
    slug: "egerton-university",
    location: "Njoro, Kenya",
    type: "public",
    description: "Université publique de premier plan spécialisée en agriculture, sciences vétérinaires et ressources naturelles. Propose également des programmes en commerce, éducation et ingénierie.",
    programs: ["Agriculture", "Sciences Vétérinaires", "Commerce", "Éducation", "Ingénierie"],
    courses: [
      "Sciences Agricoles",
      "Médecine Vétérinaire",
      "Commerce",
      "Éducation",
      "Ingénierie"
    ],
    requirements: [
      "Diplôme d'État avec mention en sciences.",
      "Expérience pratique (pour certains programmes).",
      "Recommandations académiques."
    ],
    fees: "$1,500 - $3,000 par an",
    categories: ["Agriculture", "Vétérinaire", "Recherche"],
    image: "/images/egerton_university.jpg",
    featured: false,
    website: "https://www.egerton.ac.ke"
  },
  {
    name: "Maseno University",
    slug: "maseno-university",
    location: "Maseno, Kenya",
    type: "public",
    description: "Université publique dans l'ouest du Kenya offrant des programmes complets en arts, sciences, commerce et éducation. Réputée pour son beau campus et la qualité de son enseignement.",
    programs: ["Arts", "Sciences", "Commerce", "Éducation", "Sciences de la Santé"],
    courses: [
      "Arts",
      "Sciences",
      "Commerce",
      "Éducation",
      "Technologies de l'Information"
    ],
    requirements: [
      "Diplôme d'État avec moyenne C+ ou équivalent.",
      "Test de langue anglaise.",
      "Entretien pour certaines filières."
    ],
    fees: "$1,500 - $2,800 par an",
    categories: ["Arts", "Sciences", "Éducation"],
    image: "/images/maseno.jpg",
    featured: false,
    website: "https://www.maseno.ac.ke"
  },
  {
    name: "Kisii University",
    slug: "kisii-university",
    location: "Kisii, Kenya",
    type: "public",
    description: "Université publique dans le comté de Kisii offrant des programmes diversifiés en commerce, éducation, sciences de la santé et sciences humaines.",
    programs: ["Commerce", "Éducation", "Sciences de la Santé", "Sciences Humaines", "Technologie"],
    courses: [
      "Commerce",
      "Éducation",
      "Sciences Infirmières",
      "Sciences Humaines",
      "Informatique"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE C+).",
      "Formulaire de candidature dûment rempli.",
      "Copie du passeport."
    ],
    fees: "$1,300 - $2,500 par an",
    categories: ["Commerce", "Éducation", "Santé"],
    image: "/images/kisii_university.jpg",
    featured: false,
    website: "https://www.kisiiuniversity.ac.ke"
  },
  {
    name: "Chuka University",
    slug: "chuka-university",
    location: "Chuka, Kenya",
    type: "public",
    description: "Université publique située dans le comté de Tharaka Nithi, offrant des programmes en commerce, éducation, agriculture et sciences de la santé.",
    programs: ["Commerce", "Éducation", "Agriculture", "Sciences de la Santé", "Technologie"],
    courses: [
      "Commerce",
      "Éducation",
      "Agriculture",
      "Sciences Infirmières",
      "Informatique"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE C+).",
      "Relevés de notes académiques.",
      "Certificat de naissance."
    ],
    fees: "$1,200 - $2,300 par an",
    categories: ["Commerce", "Éducation", "Agriculture"],
    image: "/images/chuka_university.jpg",
    featured: false,
    website: "https://www.chuka.ac.ke"
  },
  {
    name: "Laikipia University",
    slug: "laikipia-university",
    location: "Nyahururu, Kenya",
    type: "public",
    description: "Université publique dans le comté de Laikipia offrant des programmes en commerce, éducation, sciences et sciences humaines.",
    programs: ["Commerce", "Éducation", "Sciences", "Sciences Humaines", "Technologie"],
    courses: [
      "Commerce",
      "Éducation",
      "Sciences",
      "Sciences Humaines",
      "Informatique"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE C+).",
      "Preuve de maîtrise de l'anglais.",
      "Lettre de recommandation."
    ],
    fees: "$1,200 - $2,200 par an",
    categories: ["Commerce", "Éducation", "Sciences"],
    image: "/images/laikipia_university.jpeg",
    featured: false,
    website: "https://www.laikipia.ac.ke"
  },
  {
    name: "Meru University",
    slug: "meru-university",
    location: "Meru, Kenya",
    type: "public",
    description: "Université publique dans le comté de Meru offrant des programmes en commerce, éducation, agriculture et sciences de la santé.",
    programs: ["Commerce", "Éducation", "Agriculture", "Sciences de la Santé", "Technologie"],
    courses: [
      "Commerce",
      "Éducation",
      "Agriculture",
      "Sciences Infirmières",
      "Informatique"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE C+).",
      "Formulaire de candidature.",
      "Passeport valide."
    ],
    fees: "$1,200 - $2,200 par an",
    categories: ["Commerce", "Éducation", "Agriculture"],
    image: "/images/meru_university.jpg",
    featured: false,
    website: "https://www.meru.ac.ke"
  },
  {
    name: "Tom Mboya University",
    slug: "tom-mboya-university",
    location: "Homa Bay, Kenya",
    type: "public",
    description: "Université publique située dans le comté de Homa Bay, offrant des programmes en commerce, éducation, agriculture et sciences.",
    programs: ["Commerce", "Éducation", "Agriculture", "Sciences", "Technologie"],
    courses: [
      "Commerce",
      "Éducation",
      "Agriculture",
      "Sciences",
      "Informatique"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE C+).",
      "Relevés de notes.",
      "Certificat de bonne conduite."
    ],
    fees: "$1,100 - $2,000 par an",
    categories: ["Commerce", "Éducation", "Sciences"],
    image: "/images/tom_mboya.jpg",
    featured: false,
    website: "https://www.tmc.ac.ke"
  },
  {
    name: "Karatina University",
    slug: "karatina-university",
    location: "Karatina, Kenya",
    type: "public",
    description: "Université publique dans le comté de Nyeri, offrant des programmes en commerce, éducation, sciences de la santé et technologie.",
    programs: ["Commerce", "Éducation", "Sciences de la Santé", "Technologie", "Sciences"],
    courses: [
      "Commerce",
      "Éducation",
      "Sciences Infirmières",
      "Informatique",
      "Sciences"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE C+).",
      "Formulaire de candidature.",
      "Certificat médical."
    ],
    fees: "$1,100 - $2,100 par an",
    categories: ["Commerce", "Éducation", "Santé"],
    image: "/images/Karatina-University.jpg",
    featured: false,
    website: "https://www.karatinauniversity.ac.ke"
  },
  {
    name: "University of Eldoret",
    slug: "university-of-eldoret",
    location: "Eldoret, Kenya",
    type: "public",
    description: "Université publique à Eldoret offrant des programmes en commerce, éducation, agriculture, sciences et technologies.",
    programs: ["Commerce", "Éducation", "Agriculture", "Sciences", "Technologie"],
    courses: [
      "Commerce",
      "Éducation",
      "Agriculture",
      "Sciences",
      "Informatique"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE C+).",
      "Relevés de notes.",
      "Lettre de motivation."
    ],
    fees: "$1,100 - $2,000 par an",
    categories: ["Commerce", "Éducation", "Agriculture"],
    image: "/images/university_of_eldoret.jpg",
    featured: false,
    website: "https://www.uoeld.ac.ke"
  },

  // ============ PRIVATE UNIVERSITIES ============
  {
    name: "Strathmore University",
    slug: "strathmore-university",
    location: "Nairobi, Kenya",
    type: "private",
    description: "Institution d'enseignement supérieur de premier plan au Kenya, reconnue pour son excellence dans les domaines de la technologie, des affaires et du droit. Campus moderne à Nairobi, offrant un environnement d'apprentissage rigoureux.",
    programs: ["Informatique", "Commerce", "Droit", "Finance", "Génie Logiciel"],
    courses: [
      "Informatique et Réseaux",
      "Gestion d'Entreprise",
      "Finance et Comptabilité",
      "Droit",
      "Génie Logiciel"
    ],
    requirements: [
      "Diplôme d'État avec une moyenne minimale de 60% (ou équivalent KCSE C+).",
      "Preuve de maîtrise de l'anglais (Test interne ou TOEFL/IELTS).",
      "Passeport valide pour les démarches de visa étudiant.",
      "Lettre de motivation (pour certaines facultés)."
    ],
    fees: "$3,000 - $4,500 par an",
    categories: ["Technologie", "Business", "Droit"],
    image: "/images/strathmore.jpg",
    featured: true,
    website: "https://strathmore.edu"
  },
  {
    name: "United States International University - Africa (USIU)",
    slug: "usiu-africa",
    location: "Nairobi, Kenya",
    type: "private",
    description: "Offre une expérience véritablement internationale, avec un campus diversifié accueillant des étudiants de plus de 70 pays. Double accréditation aux États-Unis et au Kenya, proposant des diplômes mondialement reconnus.",
    programs: ["Relations Internationales", "Pharmacie", "Systèmes d'Information", "Journalisme"],
    courses: [
      "Relations Internationales",
      "Pharmacie",
      "Systèmes d'Information",
      "Journalisme",
      "Administration des Affaires"
    ],
    requirements: [
      "Diplôme d'État avec une moyenne satisfaisante.",
      "Réussite de l'examen de placement en anglais et mathématiques.",
      "Traductions certifiées des relevés de notes en anglais."
    ],
    fees: "$4,000 - $6,000 par an",
    categories: ["International", "Santé", "Communication"],
    image: "/images/USIU.jpg",
    featured: true,
    website: "https://www.usiu.ac.ke"
  },
  {
    name: "Daystar University",
    slug: "daystar-university",
    location: "Nairobi & Athi River, Kenya",
    type: "private",
    description: "Reconnue pour produire certains des meilleurs journalistes et experts en communication d'Afrique de l'Est. Enseignement basé sur des valeurs chrétiennes. Campus principal d'Athi River avec vue sur la savane.",
    programs: ["Communication", "Soins Infirmiers", "Psychologie", "Commerce"],
    courses: [
      "Communication Audiovisuelle",
      "Soins Infirmiers",
      "Psychologie Clinique",
      "Commerce et Économie"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE C+).",
      "Recommandation morale ou religieuse (souvent demandée).",
      "Examen d'entrée en anglais."
    ],
    fees: "$2,800 - $4,200 par an",
    categories: ["Communication", "Arts", "Santé"],
    image: "/images/daystar.university.jpg",
    featured: false,
    website: "https://www.daystar.ac.ke"
  },
  {
    name: "Africa Nazarene University",
    slug: "africa-nazarene-university",
    location: "Nairobi, Kenya",
    type: "private",
    description: "Université chrétienne privée offrant des programmes en commerce, éducation, sciences de la santé et sciences humaines. Engagée dans l'éducation holistique et le développement communautaire.",
    programs: ["Commerce", "Éducation", "Sciences de la Santé", "Sciences Humaines"],
    courses: [
      "Commerce",
      "Éducation",
      "Sciences Infirmières",
      "Sciences Humaines",
      "Théologie"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE B).",
      "Recommandations académiques.",
      "Lettre de motivation."
    ],
    fees: "$2,500 - $4,000 par an",
    categories: ["Commerce", "Éducation", "Santé"],
    image: "/images/africa_nazarene.jpg",
    featured: false,
    website: "https://www.anu.ac.ke"
  },
  {
    name: "KCA University",
    slug: "kca-university",
    location: "Nairobi, Kenya",
    type: "private",
    description: "Université privée spécialisée en commerce, technologies de l'information et comptabilité. Réputée pour son approche pratique et ses partenariats industriels.",
    programs: ["Commerce", "Informatique", "Comptabilité", "Finance", "Marketing"],
    courses: [
      "Commerce",
      "Systèmes d'Information",
      "Comptabilité",
      "Finance",
      "Marketing"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE B).",
      "Examen d'entrée.",
      "Expérience professionnelle (pour certains programmes)."
    ],
    fees: "$2,200 - $3,800 par an",
    categories: ["Commerce", "Informatique", "Finance"],
    image: "/images/KCA_university.jpg",
    featured: false,
    website: "https://www.kca.ac.ke"
  },
  {
    name: "Methodist University of Kenya",
    slug: "methodist-university",
    location: "Nairobi, Kenya",
    type: "private",
    description: "Université chrétienne privée offrant des programmes en commerce, éducation, sciences de la santé et sciences humaines. Axée sur le développement de leaders éthiques.",
    programs: ["Commerce", "Éducation", "Sciences de la Santé", "Sciences Humaines"],
    courses: [
      "Commerce",
      "Éducation",
      "Sciences Infirmières",
      "Sciences Humaines",
      "Théologie"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE B).",
      "Recommandations académiques.",
      "Entretien."
    ],
    fees: "$2,000 - $3,500 par an",
    categories: ["Commerce", "Éducation", "Santé"],
    image: "/images/methodist_university.jpg",
    featured: false,
    website: "https://www.mu.ac.ke"
  },

  // ============ INTERNATIONAL UNIVERSITIES ============
  {
    name: "Africa International University",
    slug: "africa-international-university",
    location: "Nairobi, Kenya",
    type: "international",
    description: "Université internationale offrant des programmes en théologie, commerce, éducation et sciences sociales. Attire des étudiants de toute l'Afrique et au-delà.",
    programs: ["Théologie", "Commerce", "Éducation", "Sciences Sociales"],
    courses: [
      "Théologie",
      "Commerce",
      "Éducation",
      "Sciences Sociales",
      "Sciences Humaines"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE C+).",
      "Recommandations académiques.",
      "Lettre de motivation."
    ],
    fees: "$1,800 - $3,200 par an",
    categories: ["Théologie", "Commerce", "Éducation"],
    image: "/images/africa_international.jpg",
    featured: false,
    website: "https://www.aiu.ac.ke"
  },
  {
    name: "Riara University",
    slug: "riara-university",
    location: "Nairobi, Kenya",
    type: "international",
    description: "Université moderne offrant une éducation de niveau international en commerce, sciences humaines et technologie. Connue pour son programme innovant et ses partenariats mondiaux.",
    programs: ["Commerce", "Sciences Humaines", "Technologie", "Arts"],
    courses: [
      "Commerce",
      "Sciences Humaines",
      "Technologies de l'Information",
      "Arts",
      "Éducation"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE B).",
      "Test de langue anglaise.",
      "Entretien."
    ],
    fees: "$2,500 - $4,500 par an",
    categories: ["Commerce", "Technologie", "Arts"],
    image: "/images/riara_university.jpg",
    featured: false,
    website: "https://www.riara.ac.ke"
  },

  // ============ TVET INSTITUTIONS ============
  {
    name: "Technical University of Kenya",
    slug: "technical-university-kenya",
    location: "Nairobi, Kenya",
    type: "tvet",
    description: "Université technique de premier plan au Kenya offrant des programmes en ingénierie, technologie et sciences appliquées. Se concentre sur les compétences pratiques et l'employabilité.",
    programs: ["Ingénierie", "Technologie", "Sciences Appliquées", "Architecture"],
    courses: [
      "Ingénierie",
      "Technologie",
      "Sciences Appliquées",
      "Architecture",
      "Informatique"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE C+).",
      "Expérience pratique (pour certains programmes).",
      "Portfolio (pour architecture)."
    ],
    fees: "$1,500 - $3,000 par an",
    categories: ["Ingénierie", "Technologie", "TVET"],
    image: "/images/Technical_university_of_kenya.jpg",
    featured: false,
    website: "https://www.tuk.ac.ke"
  },
  {
    name: "Taita Taveta University",
    slug: "taita-taveta-university",
    location: "Taita Taveta, Kenya",
    type: "tvet",
    description: "Université technique spécialisée en exploitation minière, ingénierie et ressources naturelles. Propose des programmes pratiques adaptés aux besoins de l'industrie.",
    programs: ["Exploitation Minière", "Ingénierie", "Ressources Naturelles", "Technologie"],
    courses: [
      "Exploitation Minière",
      "Ingénierie",
      "Ressources Naturelles",
      "Technologies de l'Information",
      "Commerce"
    ],
    requirements: [
      "Diplôme d'État (équivalent KCSE C+).",
      "Expérience pratique souhaitée.",
      "Certificat médical."
    ],
    fees: "$1,200 - $2,200 par an",
    categories: ["Exploitation Minière", "Ingénierie", "TVET"],
    image: "/images/taita_university.jpg",
    featured: false,
    website: "https://www.ttu.ac.ke"
  }
];

async function seed() {
  try {
    console.log('🌱 Connecting to Supabase for seeding...');
    console.log(`📊 Found ${universitiesData.length} universities to seed`);

    // Check if universities already exist
    const { data: existing, error: checkError } = await supabase
      .from('universities')
      .select('slug');

    if (checkError) {
      console.error('❌ Error checking existing universities:', checkError.message);
      process.exit(1);
    }

    const existingSlugs = existing ? existing.map(u => u.slug) : [];
    const newUniversities = universitiesData.filter(u => !existingSlugs.includes(u.slug));

    if (newUniversities.length === 0) {
      console.log('✅ All universities already exist in the database!');
      console.log(`📚 Total: ${existingSlugs.length} universities`);
      process.exit(0);
    }

    console.log(`📝 ${newUniversities.length} new universities to insert`);

    // Insert only new universities
    const { data, error } = await supabase
      .from('universities')
      .insert(newUniversities)
      .select();

    if (error) {
      console.error('❌ Error inserting universities:', error.message);
      process.exit(1);
    }

    console.log(`✅ ${data ? data.length : 0} universités ont été insérées avec succès !`);
    
    // Show summary by type
    const { data: all, error: countError } = await supabase
      .from('universities')
      .select('type')
      .order('type');

    if (!countError && all) {
      const summary = all.reduce((acc, u) => {
        acc[u.type] = (acc[u.type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Summary by type:');
      Object.entries(summary).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

seed();