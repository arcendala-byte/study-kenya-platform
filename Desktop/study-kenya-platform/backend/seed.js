require('dotenv').config();
const supabase = require('./supabaseClient');

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const universities = [
  { name: "Strathmore University", location: "Nairobi", type: "Private", description: "Elite en business et tech.", courses: ["IT", "Business", "Law"], fees: "3000$", categories: ["Privé", "Tech"], image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f" },
  { name: "USIU-Africa", location: "Nairobi", type: "Private", description: "International hub.", courses: ["Relations Int.", "Psychologie"], fees: "2500$", categories: ["International"], image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1" },
  { name: "University of Nairobi", location: "Nairobi", type: "Public", description: "La plus prestigieuse.", courses: ["Médecine", "Droit"], fees: "1500$", categories: ["Public"], image: "https://images.unsplash.com/photo-1562774053-701939374585" },
  { name: "Mount Kenya University", location: "Thika", type: "Private", description: "Abordable et vaste.", courses: ["Santé", "Business"], fees: "1200$", categories: ["Privé"], image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952" },
  { name: "Kenyatta University", location: "Nairobi", type: "Public", description: "Excellence en éducation.", courses: ["Éducation", "Arts"], fees: "1400$", categories: ["Public"], image: "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc" },
  { name: "Daystar University", location: "Athi River", type: "Private", description: "Hub de communication.", courses: ["Médias", "Journalisme"], fees: "2000$", categories: ["Chrétien"], image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846" },
  { name: "Riara University", location: "Nairobi", type: "Private", description: "Innovation en droit.", courses: ["Droit", "IT"], fees: "2200$", categories: ["Innovation"], image: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae" },
  { name: "KCA University", location: "Nairobi", type: "Private", description: "Finance et audit.", courses: ["Finance", "Comptabilité"], fees: "1800$", categories: ["Finance"], image: "https://images.unsplash.com/photo-1454165833762-02ab4f40b630" },
  { name: "Catholic University", location: "Nairobi", type: "Private", description: "Rigueur à Karen.", courses: ["Social", "Philosophie"], fees: "1900$", categories: ["Arts"], image: "https://images.unsplash.com/photo-1498243639359-2830baa750c8" },
  { name: "Zetech University", location: "Ruiru", type: "Private", description: "Tech et innovation.", courses: ["IT", "Hôtellerie"], fees: "1300$", categories: ["Tech"], image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c" },
  { name: "Multimedia University", location: "Nairobi", type: "Public", description: "Média et tech.", courses: ["Film", "Animation"], fees: "1500$", categories: ["Médias"], image: "https://images.unsplash.com/photo-1491845339675-238fee7b7d41" },
  { name: "Africa Nazarene University", location: "Nairobi", type: "Private", description: "Valeurs et leadership.", courses: ["Droit", "Business"], fees: "2100$", categories: ["Karen"], image: "https://images.unsplash.com/photo-1509062522246-3755977927d7" },
  { name: "Technical University of Kenya", location: "Nairobi", type: "Public", description: "Sciences appliquées.", courses: ["Génie", "Chimie"], fees: "1200$", categories: ["Public"], image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" },
  { name: "Scott Christian University", location: "Machakos", type: "Private", description: "Formation spirituelle.", courses: ["Théologie", "Éducation"], fees: "1000$", categories: ["Chrétien"], image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2" },
  { name: "Lukenya University", location: "Makueni", type: "Private", description: "Développement rural.", courses: ["Agriculture", "Business"], fees: "1100$", categories: ["Rural"], image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef" },
  { name: "Maseno University", location: "Kisumu", type: "Public", description: "L'équateur.", courses: ["Informatique", "Santé"], fees: "1300$", categories: ["Public"], image: "https://images.unsplash.com/photo-1460518451285-cd7bcaf19591" },
  { name: "Egerton University", location: "Njoro", type: "Public", description: "Agriculture.", courses: ["Génie", "Vétérinaire"], fees: "1400$", categories: ["Agriculture"], image: "https://images.unsplash.com/photo-1500673922987-e212871fec22" },
  { name: "JKUAT", location: "Juja", type: "Public", description: "Tech et génie.", courses: ["Mécatronique", "Informatique"], fees: "1600$", categories: ["Tech"], image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97" },
  { name: "Moi University", location: "Eldoret", type: "Public", description: "Médecine.", courses: ["Médecine", "Journalisme"], fees: "1500$", categories: ["Public"], image: "https://images.unsplash.com/photo-1497366216548-37526070297c" },
  { name: "Kabarak University", location: "Nakuru", type: "Private", description: "Valeurs bibliques.", courses: ["Pharmacie", "Musique"], fees: "2000$", categories: ["Chrétien"], image: "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc" },
  { name: "Meru University", location: "Meru", type: "Public", description: "Tech.", courses: ["IT", "Génie"], fees: "1200$", categories: ["Tech"], image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa" },
  { name: "Karatina University", location: "Karatina", type: "Public", description: "Environnement.", courses: ["Nature", "Agriculture"], fees: "1100$", categories: ["Nature"], image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b" },
  { name: "SEKU", location: "Kitui", type: "Public", description: "Aride.", courses: ["Géologie", "Hydrologie"], fees: "1000$", categories: ["Science"], image: "https://images.unsplash.com/photo-1444491741275-3747c53c99b4" },
  { name: "Management University", location: "Nairobi", type: "Private", description: "Leadership.", courses: ["Gestion", "RH"], fees: "1800$", categories: ["Leadership"], image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf" },
  { name: "Kiriri Women's", location: "Nairobi", type: "Private", description: "Femmes.", courses: ["Science", "Maths"], fees: "1600$", categories: ["Femmes"], image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644" },
  { name: "Pwani University", location: "Kilifi", type: "Public", description: "Océan.", courses: ["Marine", "Bio"], fees: "1200$", categories: ["Océan"], image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2" },
  { name: "Chuka University", location: "Chuka", type: "Public", description: "Mont Kenya.", courses: ["Informatique", "Éducation"], fees: "1100$", categories: ["Public"], image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97" },
  { name: "Maasai Mara", location: "Narok", type: "Public", description: "Faune.", courses: ["Tourisme", "Nature"], fees: "1300$", categories: ["Tourisme"], image: "https://images.unsplash.com/photo-1516422213484-21437ef130c6" },
  { name: "Laikipia University", location: "Nyahururu", type: "Public", description: "Arts.", courses: ["Philosophie", "Social"], fees: "1200$", categories: ["Arts"], image: "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc" },
  { name: "Taita Taveta", location: "Voi", type: "Public", description: "Mines.", courses: ["Minier", "Informatics"], fees: "1400$", categories: ["Mines"], image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" },
  { name: "Kabianga", location: "Kericho", type: "Public", description: "Nature.", courses: ["Agriculture", "Biologie"], fees: "1100$", categories: ["Nature"], image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef" },
  { name: "St. Paul's", location: "Limuru", type: "Private", description: "Chrétien.", courses: ["Théologie", "Comms"], fees: "1900$", categories: ["Limuru"], image: "https://images.unsplash.com/photo-1491845339675-238fee7b7d41" },
  { name: "PAC University", location: "Nairobi", type: "Private", description: "Leadership.", courses: ["Psychologie", "Gestion"], fees: "1800$", categories: ["Leadership"], image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644" },
  { name: "Garissa University", location: "Garissa", type: "Public", description: "Nord-Est.", courses: ["Gestion", "Éducation"], fees: "1000$", categories: ["Nord-Est"], image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6" },
  { name: "Rongo University", location: "Rongo", type: "Public", description: "Innovation.", courses: ["Informatics", "Science"], fees: "1100$", categories: ["Innovation"], image: "https://images.unsplash.com/photo-1509062522246-3755977927d7" },
  { name: "Embu University", location: "Embu", type: "Public", description: "Science.", courses: ["Informatics", "Maths"], fees: "1200$", categories: ["Science"], image: "https://images.unsplash.com/photo-1454165833762-02ab4f40b630" },
  { name: "Muranga University", location: "Muranga", type: "Public", description: "Tech.", courses: ["Software", "Génie"], fees: "1300$", categories: ["Tech"], image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97" },
  { name: "Kirinyaga University", location: "Kutus", type: "Public", description: "Innovation.", courses: ["Santé", "Computing"], fees: "1100$", categories: ["Santé"], image: "https://images.unsplash.com/photo-1527336367561-83d230bc364a" },
  { name: "Co-op University", location: "Karen", type: "Public", description: "Karen.", courses: ["Business", "ICT"], fees: "1500$", categories: ["Coopérative"], image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c" },
  { name: "DeKUT", location: "Nyeri", type: "Public", description: "Industriel.", courses: ["Mécatronique", "Génie"], fees: "1600$", categories: ["Industriel"], image: "https://images.unsplash.com/photo-1497366216548-37526070297c" },
  { name: "Gretsa University", location: "Thika", type: "Private", description: "Innovation.", courses: ["Hôtellerie", "IT"], fees: "1400$", categories: ["Innovation"], image: "https://images.unsplash.com/photo-1540317580114-ed684c0c5c14" },
  { name: "AIU", location: "Karen", type: "Private", description: "International.", courses: ["Théologie", "Leadership"], fees: "2200$", categories: ["International"], image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644" },
  { name: "TEAU", location: "Kitengela", type: "Private", description: "Régional.", courses: ["Business", "IT"], fees: "1200$", categories: ["Régional"], image: "https://images.unsplash.com/photo-1460518451285-cd7bcaf19591" },
  { name: "AUA", location: "Rongai", type: "Private", description: "Postgrade.", courses: ["Santé", "Theologie"], fees: "2500$", categories: ["Postgrade"], image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f" },
  { name: "MUA Main", location: "Nairobi", type: "Private", description: "Leadership.", courses: ["Gestion", "RH"], fees: "1800$", categories: ["Leadership"], image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf" },
  { name: "Machakos Uni", location: "Machakos", type: "Public", description: "Tech.", courses: ["Génie", "Hôtellerie"], fees: "1200$", categories: ["Tech"], image: "https://images.unsplash.com/photo-1509062522246-3755977927d7" },
  { name: "Kisii Uni", location: "Kisii", type: "Public", description: "Droit.", courses: ["Droit", "Médical"], fees: "1100$", categories: ["Droit"], image: "https://images.unsplash.com/photo-1497366216548-37526070297c" },
  { name: "Alupe Uni", location: "Busia", type: "Public", description: "Santé.", courses: ["Santé", "Science"], fees: "1200$", categories: ["Santé"], image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97" },
  { name: "Turkana Uni", location: "Lodwar", type: "Public", description: "Nord.", courses: ["Travail Social", "Arts"], fees: "1000$", categories: ["Nord"], image: "https://images.unsplash.com/photo-1516422213484-21437ef130c6" },
  { name: "UoE Eldoret", location: "Eldoret", type: "Public", description: "Science.", courses: ["Agriculture", "Biologie"], fees: "1400$", categories: ["Science"], image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97" },
  { name: "Zetech V2", location: "Ruiru", type: "Private", description: "Employabilité.", courses: ["IT", "Hôtellerie"], fees: "1500$", categories: ["Tech"], image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c" },
  { name: "Strathmore V2", location: "Nairobi", type: "Private", description: "Elite.", courses: ["Finance", "Droit"], fees: "2800$", categories: ["Elite"], image: "https://images.unsplash.com/photo-1497366216548-37526070297c" },
  { name: "USIU V2", location: "Nairobi", type: "Private", description: "International.", courses: ["Relations Int.", "Psychologie"], fees: "3200$", categories: ["International"], image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644" },
  { name: "Daystar V2", location: "Athi River", type: "Private", description: "Médias.", courses: ["Communication", "Éducation"], fees: "2400$", categories: ["Médias"], image: "https://images.unsplash.com/photo-1491845339675-238fee7b7d41" },
  { name: "Riara V2", location: "Nairobi", type: "Private", description: "Innovation.", courses: ["Droit", "Computing"], fees: "2300$", categories: ["Innovation"], image: "https://images.unsplash.com/photo-1509062522246-3755977927d7" },
  { name: "KCA V2", location: "Nairobi", type: "Private", description: "Finance.", courses: ["Finance", "Comptabilité"], fees: "1600$", categories: ["Finance"], image: "https://images.unsplash.com/photo-1454165833762-02ab4f40b630" },
  { name: "MMU V2", location: "Nairobi", type: "Public", description: "Média.", courses: ["Film", "Animation"], fees: "1500$", categories: ["Médias"], image: "https://images.unsplash.com/photo-1491845339675-238fee7b7d41" },
  { name: "Maseno V2", location: "Kisumu", type: "Public", description: "Tech.", courses: ["Informatique", "Science"], fees: "1300$", categories: ["Tech"], image: "https://images.unsplash.com/photo-1460518451285-cd7bcaf19591" },
  { name: "JKUAT V2", location: "Juja", type: "Public", description: "Génie.", courses: ["Mécatronique", "Informatique"], fees: "1600$", categories: ["Tech"], image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97" },
  { name: "Moi V2", location: "Eldoret", type: "Public", description: "Médecine.", courses: ["Médecine", "Journalisme"], fees: "1500$", categories: ["Public"], image: "https://images.unsplash.com/photo-1497366216548-37526070297c" },
  { name: "KU V2", location: "Nairobi", type: "Public", description: "Éducation.", courses: ["Éducation", "Arts"], fees: "1400$", categories: ["Public"], image: "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc" },
  { name: "Egerton V2", location: "Njoro", type: "Public", description: "Agriculture.", courses: ["Génie", "Vétérinaire"], fees: "1400$", categories: ["Agriculture"], image: "https://images.unsplash.com/photo-1500673922987-e212871fec22" },
  { name: "Kabarak V2", location: "Nakuru", type: "Private", description: "Valeurs.", courses: ["Pharmacie", "Musique"], fees: "2100$", categories: ["Chrétien"], image: "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc" },
  { name: "CUEA V2", location: "Nairobi", type: "Private", description: "Karen.", courses: ["Philosophie", "Droit"], fees: "1900$", categories: ["Arts"], image: "https://images.unsplash.com/photo-1498243639359-2830baa750c8" },
  { name: "Riara V3", location: "Nairobi", type: "Private", description: "Innovation.", courses: ["Computing", "IT"], fees: "2300$", categories: ["Innovation"], image: "https://images.unsplash.com/photo-1509062522246-3755977927d7" },
  { name: "KCA V3", location: "Nairobi", type: "Private", description: "Finance.", courses: ["Accounting", "Finance"], fees: "1600$", categories: ["Finance"], image: "https://images.unsplash.com/photo-1454165833762-02ab4f40b630" },
  { name: "MKU V3", location: "Thika", type: "Private", description: "Global.", courses: ["Santé", "Education"], fees: "1600$", categories: ["Privé"], image: "https://images.unsplash.com/photo-1540317580114-ed684c0c5c14" },
  { name: "Strath V3", location: "Nairobi", type: "Private", description: "Elite.", courses: ["Informatics", "Data"], fees: "2800$", categories: ["Privé"], image: "https://images.unsplash.com/photo-1497366216548-37526070297c" },
  { name: "USIU V3", location: "Nairobi", type: "Private", description: "International.", courses: ["Psychology", "Relations"], fees: "3200$", categories: ["Privé"], image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644" },
  { name: "Daystar V3", location: "Athi River", type: "Private", description: "Communication.", courses: ["Media", "Comms"], fees: "2400$", categories: ["Privé"], image: "https://images.unsplash.com/photo-1491845339675-238fee7b7d41" },
  { name: "TUK V2", location: "Nairobi", type: "Public", description: "Tech.", courses: ["Génie", "Science"], fees: "1200$", categories: ["Public"], image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" },
  { name: "Scott V2", location: "Machakos", type: "Private", description: "Chrétien.", courses: ["Théologie", "Arts"], fees: "1000$", categories: ["Privé"], image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2" },
  { name: "Lukenya V2", location: "Makueni", type: "Private", description: "Rural.", courses: ["Agriculture", "ICT"], fees: "1100$", categories: ["Privé"], image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef" },
  { name: "Masinde Muliro", location: "Kakamega", type: "Public", description: "Science et Tech.", courses: ["Génie", "Bio"], fees: "1200$", categories: ["Public"], image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f" },
  { name: "South Eastern V3", location: "Kitui", type: "Public", description: "Science.", courses: ["Science", "Maths"], fees: "1000$", categories: ["Public"], image: "https://images.unsplash.com/photo-1444491741275-3747c53c99b4" }
];

const universitiesWithSlugs = universities.map(uni => ({
  ...uni,
  slug: slugify(uni.name)
}));

async function seed() {
  try {
    console.log('Connecting to Supabase for seeding...');
    const universitiesWithSlugs = universities.map(uni => ({
      ...uni,
      slug: slugify(uni.name)
    }));

    const { error: delErr } = await supabase.from('universities').delete().neq('name', '');
    if (delErr) console.warn('Warning deleting existing universities:', delErr.message);

    const { data, error } = await supabase.from('universities').insert(universitiesWithSlugs);
    if (error) {
      console.error('❌ Erreur inserting universities:', error.message);
      process.exit(1);
    }

    console.log(`✅ Base de données mise à jour avec ${data.length} universités !`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err);
    process.exit(1);
  }
}

seed();