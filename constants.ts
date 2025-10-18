
import type { RegionData } from './types';

export const REGIONS_DATA: RegionData = {
  "Africa (North)": ["Algeria", "Egypt", "Libya", "Morocco", "Sudan", "Tunisia"],
  "Africa (Sub-Saharan)": ["Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cameroon", "Cape Verde", "Central African Republic", "Chad", "Comoros", "Congo (Brazzaville)", "Congo (Kinshasa)", "Djibouti", "Equatorial Guinea", "Eritrea", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Swaziland", "Tanzania", "Togo", "Uganda", "Zambia", "Zimbabwe"],
  "Asia (East)": ["China", "Japan", "Mongolia", "North Korea", "South Korea", "Taiwan"],
  "Asia (Central & South)": ["Afghanistan", "Bangladesh", "Bhutan", "India", "Iran", "Kazakhstan", "Kyrgyzstan", "Maldives", "Nepal", "Pakistan", "Sri Lanka", "Tajikistan", "Turkmenistan", "Uzbekistan"],
  "Asia (Southeast)": ["Brunei", "Burma (Myanmar)", "Cambodia", "Indonesia", "Laos", "Malaysia", "Philippines", "Singapore", "Thailand", "Timor-Leste", "Vietnam"],
  "Europe (Western)": ["Andorra", "Austria", "Belgium", "France", "Germany", "Ireland", "Liechtenstein", "Luxembourg", "Monaco", "Netherlands", "Portugal", "Spain", "Switzerland", "United Kingdom"],
  "Europe (Northern)": ["Denmark", "Estonia", "Finland", "Iceland", "Latvia", "Lithuania", "Norway", "Sweden"],
  "Europe (Eastern)": ["Belarus", "Bulgaria", "Czech Republic", "Hungary", "Moldova", "Poland", "Romania", "Russia", "Slovakia", "Ukraine"],
  "Europe (Southern)": ["Albania", "Bosnia and Herzegovina", "Croatia", "Cyprus", "Greece", "Italy", "Kosovo", "Macedonia", "Malta", "Montenegro", "San Marino", "Serbia", "Slovenia", "Vatican City"],
  "Middle East": ["Bahrain", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Oman", "Palestine", "Qatar", "Saudi Arabia", "Syria", "Turkey", "United Arab Emirates", "Yemen"],
  "North America (USA/Canada)": ["Canada", "United States"],
  "North America (Mexico/Central)": ["Belize", "Costa Rica", "El Salvador", "Guatemala", "Honduras", "Mexico", "Nicaragua", "Panama"],
  "South America": ["Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"],
  "Oceania": ["Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru", "New Zealand", "Palau", "Papua New Guinea", "Samoa", "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu"],
  "Caribbean": ["Antigua and Barbuda", "Bahamas", "Barbados", "Cuba", "Dominica", "Dominican Republic", "Grenada", "Haiti", "Jamaica", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago"]
};

export const CITIES_DATA: { [key: string]: string[] } = {
  // Europe (Southern)
  "Greece": ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos", "Rhodes", "Ioannina", "Chania", "Corinth"],
  "Italy": ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania", "Venice"],
  "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Bilbao", "Alicante"],
  "Portugal": ["Lisbon", "Porto", "Amadora", "Braga", "Setúbal", "Coimbra"],
  // Europe (Western)
  "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
  "Germany": ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig"],
  "United Kingdom": ["London", "Birmingham", "Glasgow", "Liverpool", "Bristol", "Manchester", "Sheffield", "Leeds", "Edinburgh", "Leicester"],
  "Ireland": ["Dublin", "Cork", "Limerick", "Galway", "Waterford"],
  // North America
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "San Francisco", "Indianapolis", "Columbus", "Seattle", "Denver", "Washington", "Boston"],
  "Canada": ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton"],
  "Mexico": ["Mexico City", "Tijuana", "Ecatepec", "León", "Puebla", "Ciudad Juárez", "Guadalajara", "Zapopan", "Monterrey"],
  // Asia (East)
  "China": ["Shanghai", "Beijing", "Chongqing", "Tianjin", "Guangzhou", "Shenzhen", "Chengdu", "Nanjing", "Wuhan", "Hangzhou"],
  "Japan": ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto", "Saitama", "Hiroshima"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan", "Changwon"],
  // Asia (Central & South)
  "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"],
  "Iran": ["Tehran", "Mashhad", "Isfahan", "Karaj", "Shiraz", "Tabriz", "Qom", "Ahvaz"],
  // Africa (North)
  "Egypt": ["Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Aswan"],
  "Morocco": ["Casablanca", "Rabat", "Fes", "Marrakesh", "Tangier", "Agadir"],
  // South America
  "Brazil": ["São Paulo", "Rio de Janeiro", "Salvador", "Brasília", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife"],
  "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán", "Mar del Plata"],
  // Default fallback for other countries to prevent empty dropdowns
  "Default": ["Capital City", "Major Port", "Historic Town", "Trade Center"]
};


export const TOPICS: string[] = [
  "General Summary",
  "Art & Culture",
  "Entertainment",
  "War & Conflict",
  "Politics & Governance",
  "Religion & Philosophy",
  "Science & Technology",
  "Daily Life",
  "Occult & Esotericism",
  "Humor & Anecdotes",
  "Conspiracy Theories",
];
