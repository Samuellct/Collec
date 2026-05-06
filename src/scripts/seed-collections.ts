import config from '../payload.config.ts'
import { getPayload } from 'payload'
import { fetchMovieDetail, fetchTvDetail } from '../modules/media-items/tmdb/fetch-detail.ts'
import { normalizeMovie, normalizeTv } from '../modules/media-items/tmdb/normalize.ts'
import { tmdbFetch } from '../modules/media-items/tmdb/client.ts'
import type { CollectionTypeValue, AccessibilityLevelValue } from '../modules/collections/constants.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MediaType = 'movie' | 'tv'

interface ItemDef {
  title: string
  year: number
  mediaType: MediaType
  tmdbId?: number
}

interface CollectionDef {
  slug: string
  title: string
  type: CollectionTypeValue
  accessibility_level: AccessibilityLevelValue
  short_description: string
  editorial_note?: string
  is_open: boolean
  display_order: number
  items: ItemDef[]
}

// ---------------------------------------------------------------------------
// Catalogue data
// ---------------------------------------------------------------------------

const COLLECTIONS: CollectionDef[] = [
  // 1 -----------------------------------------------------------------------
  {
    slug: 'kubrick-integrale',
    title: 'Kubrick intégrale',
    type: 'filmography_complete',
    accessibility_level: 'cinephile',
    short_description: "L'intégrale de Stanley Kubrick, de 1953 à 1999. 13 films, une oeuvre.",
    is_open: false,
    display_order: 1,
    items: [
      { title: 'Fear and Desire', year: 1953, mediaType: 'movie' },
      { title: "Killer's Kiss", year: 1955, mediaType: 'movie' },
      { title: 'The Killing', year: 1956, mediaType: 'movie' },
      { title: 'Paths of Glory', year: 1957, mediaType: 'movie' },
      { title: 'Spartacus', year: 1960, mediaType: 'movie' },
      { title: 'Lolita', year: 1962, mediaType: 'movie' },
      { title: 'Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb', year: 1964, mediaType: 'movie' },
      { title: '2001: A Space Odyssey', year: 1968, mediaType: 'movie' },
      { title: 'A Clockwork Orange', year: 1971, mediaType: 'movie' },
      { title: 'Barry Lyndon', year: 1975, mediaType: 'movie' },
      { title: 'The Shining', year: 1980, mediaType: 'movie' },
      { title: 'Full Metal Jacket', year: 1987, mediaType: 'movie' },
      { title: 'Eyes Wide Shut', year: 1999, mediaType: 'movie' },
    ],
  },

  // 2 -----------------------------------------------------------------------
  {
    slug: 'scorsese-integrale',
    title: 'Scorsese intégrale',
    type: 'filmography_complete',
    accessibility_level: 'curieux',
    short_description: "L'intégrale de Martin Scorsese, de 1967 à 2023. 26 films, des chefs-d'oeuvre aux découvertes.",
    is_open: false,
    display_order: 2,
    items: [
      { title: "Who's That Knocking at My Door", year: 1967, mediaType: 'movie' },
      { title: 'Boxcar Bertha', year: 1972, mediaType: 'movie' },
      { title: 'Mean Streets', year: 1973, mediaType: 'movie' },
      { title: "Alice Doesn't Live Here Anymore", year: 1974, mediaType: 'movie' },
      { title: 'Taxi Driver', year: 1976, mediaType: 'movie' },
      { title: 'New York, New York', year: 1977, mediaType: 'movie' },
      { title: 'Raging Bull', year: 1980, mediaType: 'movie' },
      { title: 'The King of Comedy', year: 1982, mediaType: 'movie' },
      { title: 'After Hours', year: 1985, mediaType: 'movie' },
      { title: 'The Color of Money', year: 1986, mediaType: 'movie' },
      { title: 'The Last Temptation of Christ', year: 1988, mediaType: 'movie' },
      { title: 'GoodFellas', year: 1990, mediaType: 'movie' },
      { title: 'Cape Fear', year: 1991, mediaType: 'movie' },
      { title: 'The Age of Innocence', year: 1993, mediaType: 'movie' },
      { title: 'Casino', year: 1995, mediaType: 'movie' },
      { title: 'Kundun', year: 1997, mediaType: 'movie' },
      { title: 'Bringing Out the Dead', year: 1999, mediaType: 'movie' },
      { title: 'Gangs of New York', year: 2002, mediaType: 'movie' },
      { title: 'The Aviator', year: 2004, mediaType: 'movie' },
      { title: 'The Departed', year: 2006, mediaType: 'movie' },
      { title: 'Shutter Island', year: 2010, mediaType: 'movie' },
      { title: 'Hugo', year: 2011, mediaType: 'movie' },
      { title: 'The Wolf of Wall Street', year: 2013, mediaType: 'movie' },
      { title: 'Silence', year: 2016, mediaType: 'movie' },
      { title: 'The Irishman', year: 2019, mediaType: 'movie' },
      { title: 'Killers of the Flower Moon', year: 2023, mediaType: 'movie' },
    ],
  },

  // 3 -----------------------------------------------------------------------
  {
    slug: 'miyazaki-integrale',
    title: 'Miyazaki intégrale',
    type: 'filmography_complete',
    accessibility_level: 'accessible',
    short_description: "L'intégrale des longs métrages de Hayao Miyazaki. 12 films disponibles sur Netflix.",
    is_open: false,
    display_order: 3,
    items: [
      { title: 'The Castle of Cagliostro', year: 1979, mediaType: 'movie' },
      { title: 'Nausicaä of the Valley of the Wind', year: 1984, mediaType: 'movie' },
      { title: 'Castle in the Sky', year: 1986, mediaType: 'movie' },
      { title: 'My Neighbor Totoro', year: 1988, mediaType: 'movie' },
      { title: "Kiki's Delivery Service", year: 1989, mediaType: 'movie' },
      { title: 'Porco Rosso', year: 1992, mediaType: 'movie' },
      { title: 'Princess Mononoke', year: 1997, mediaType: 'movie' },
      { title: 'Spirited Away', year: 2001, mediaType: 'movie' },
      { title: "Howl's Moving Castle", year: 2004, mediaType: 'movie' },
      { title: 'Ponyo', year: 2008, mediaType: 'movie' },
      { title: 'The Wind Rises', year: 2013, mediaType: 'movie' },
      { title: 'The Boy and the Heron', year: 2023, mediaType: 'movie' },
    ],
  },

  // 4 -----------------------------------------------------------------------
  {
    slug: 'pixar-integrale',
    title: 'Pixar intégrale',
    type: 'filmography_studio',
    accessibility_level: 'accessible',
    short_description: "Tous les films Pixar Animation Studios. Collection ouverte, mise à jour à chaque nouvelle sortie.",
    is_open: true,
    display_order: 4,
    items: [
      { title: 'Toy Story', year: 1995, mediaType: 'movie' },
      { title: "A Bug's Life", year: 1998, mediaType: 'movie' },
      { title: 'Toy Story 2', year: 1999, mediaType: 'movie' },
      { title: 'Monsters, Inc.', year: 2001, mediaType: 'movie' },
      { title: 'Finding Nemo', year: 2003, mediaType: 'movie' },
      { title: 'The Incredibles', year: 2004, mediaType: 'movie' },
      { title: 'Cars', year: 2006, mediaType: 'movie' },
      { title: 'Ratatouille', year: 2007, mediaType: 'movie' },
      { title: 'WALL-E', year: 2008, mediaType: 'movie' },
      { title: 'Up', year: 2009, mediaType: 'movie' },
      { title: 'Toy Story 3', year: 2010, mediaType: 'movie' },
      { title: 'Cars 2', year: 2011, mediaType: 'movie' },
      { title: 'Brave', year: 2012, mediaType: 'movie' },
      { title: 'Monsters University', year: 2013, mediaType: 'movie' },
      { title: 'Inside Out', year: 2015, mediaType: 'movie' },
      { title: 'The Good Dinosaur', year: 2015, mediaType: 'movie' },
      { title: 'Finding Dory', year: 2016, mediaType: 'movie' },
      { title: 'Cars 3', year: 2017, mediaType: 'movie' },
      { title: 'Coco', year: 2017, mediaType: 'movie' },
      { title: 'Incredibles 2', year: 2018, mediaType: 'movie' },
      { title: 'Toy Story 4', year: 2019, mediaType: 'movie' },
      { title: 'Onward', year: 2020, mediaType: 'movie' },
      { title: 'Soul', year: 2020, mediaType: 'movie' },
      { title: 'Luca', year: 2021, mediaType: 'movie' },
      { title: 'Turning Red', year: 2022, mediaType: 'movie' },
      { title: 'Lightyear', year: 2022, mediaType: 'movie' },
      { title: 'Elemental', year: 2023, mediaType: 'movie' },
      { title: 'Inside Out 2', year: 2024, mediaType: 'movie' },
    ],
  },

  // 5 -----------------------------------------------------------------------
  {
    slug: 'trilogie-parrain',
    title: 'Trilogie du Parrain',
    type: 'saga',
    accessibility_level: 'accessible',
    short_description: 'La trilogie de Francis Ford Coppola. Référence culturelle absolue, 3 films.',
    is_open: false,
    display_order: 5,
    items: [
      { title: 'The Godfather', year: 1972, mediaType: 'movie' },
      { title: 'The Godfather Part II', year: 1974, mediaType: 'movie' },
      { title: 'The Godfather Part III', year: 1990, mediaType: 'movie' },
    ],
  },

  // 6 -----------------------------------------------------------------------
  {
    slug: 'univers-terre-du-milieu',
    title: 'Univers de la Terre du milieu',
    type: 'franchise',
    accessibility_level: 'accessible',
    short_description: "Toutes les adaptations de Tolkien au cinéma et en série. Films et séries confondus.",
    is_open: true,
    display_order: 6,
    items: [
      { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, mediaType: 'movie' },
      { title: 'The Lord of the Rings: The Two Towers', year: 2002, mediaType: 'movie' },
      { title: 'The Lord of the Rings: The Return of the King', year: 2003, mediaType: 'movie' },
      { title: 'The Hobbit: An Unexpected Journey', year: 2012, mediaType: 'movie' },
      { title: 'The Hobbit: The Desolation of Smaug', year: 2013, mediaType: 'movie' },
      { title: 'The Hobbit: The Battle of the Five Armies', year: 2014, mediaType: 'movie' },
      { title: 'The Lord of the Rings: The War of the Rohirrim', year: 2024, mediaType: 'movie' },
      { title: 'The Lord of the Rings: The Rings of Power', year: 2022, mediaType: 'tv' },
    ],
  },

  // 7 -----------------------------------------------------------------------
  {
    slug: 'univers-harry-potter',
    title: 'Univers Harry Potter',
    type: 'franchise',
    accessibility_level: 'accessible',
    short_description: "Les 8 films Harry Potter et les 3 films Animaux Fantastiques. 11 films, un seul univers.",
    is_open: false,
    display_order: 7,
    items: [
      { title: "Harry Potter and the Sorcerer's Stone", year: 2001, mediaType: 'movie' },
      { title: 'Harry Potter and the Chamber of Secrets', year: 2002, mediaType: 'movie' },
      { title: 'Harry Potter and the Prisoner of Azkaban', year: 2004, mediaType: 'movie' },
      { title: 'Harry Potter and the Goblet of Fire', year: 2005, mediaType: 'movie' },
      { title: 'Harry Potter and the Order of the Phoenix', year: 2007, mediaType: 'movie' },
      { title: 'Harry Potter and the Half-Blood Prince', year: 2009, mediaType: 'movie' },
      { title: 'Harry Potter and the Deathly Hallows: Part 1', year: 2010, mediaType: 'movie' },
      { title: 'Harry Potter and the Deathly Hallows: Part 2', year: 2011, mediaType: 'movie' },
      { title: 'Fantastic Beasts and Where to Find Them', year: 2016, mediaType: 'movie' },
      { title: 'Fantastic Beasts: The Crimes of Grindelwald', year: 2018, mediaType: 'movie' },
      { title: 'Fantastic Beasts: The Secrets of Dumbledore', year: 2022, mediaType: 'movie' },
    ],
  },

  // 8 -----------------------------------------------------------------------
  {
    slug: 'marvel-cinematic-universe',
    title: 'Marvel Cinematic Universe',
    type: 'franchise',
    accessibility_level: 'accessible',
    short_description: "L'ensemble du MCU : films et séries Disney+. Collection ouverte, mise à jour à chaque sortie.",
    is_open: true,
    display_order: 8,
    items: [
      // Phase 1
      { title: 'Iron Man', year: 2008, mediaType: 'movie' },
      { title: 'The Incredible Hulk', year: 2008, mediaType: 'movie' },
      { title: 'Iron Man 2', year: 2010, mediaType: 'movie' },
      { title: 'Thor', year: 2011, mediaType: 'movie' },
      { title: 'Captain America: The First Avenger', year: 2011, mediaType: 'movie' },
      { title: 'The Avengers', year: 2012, mediaType: 'movie' },
      // Phase 2
      { title: 'Iron Man 3', year: 2013, mediaType: 'movie' },
      { title: 'Thor: The Dark World', year: 2013, mediaType: 'movie' },
      { title: 'Captain America: The Winter Soldier', year: 2014, mediaType: 'movie' },
      { title: 'Guardians of the Galaxy', year: 2014, mediaType: 'movie' },
      { title: 'Avengers: Age of Ultron', year: 2015, mediaType: 'movie' },
      { title: 'Ant-Man', year: 2015, mediaType: 'movie' },
      // Phase 3
      { title: 'Captain America: Civil War', year: 2016, mediaType: 'movie' },
      { title: 'Doctor Strange', year: 2016, mediaType: 'movie' },
      { title: 'Guardians of the Galaxy Vol. 2', year: 2017, mediaType: 'movie' },
      { title: 'Spider-Man: Homecoming', year: 2017, mediaType: 'movie' },
      { title: 'Thor: Ragnarok', year: 2017, mediaType: 'movie' },
      { title: 'Black Panther', year: 2018, mediaType: 'movie' },
      { title: 'Avengers: Infinity War', year: 2018, mediaType: 'movie' },
      { title: 'Ant-Man and the Wasp', year: 2018, mediaType: 'movie' },
      { title: 'Captain Marvel', year: 2019, mediaType: 'movie' },
      { title: 'Avengers: Endgame', year: 2019, mediaType: 'movie' },
      { title: 'Spider-Man: Far From Home', year: 2019, mediaType: 'movie' },
      // Phase 4
      { title: 'Black Widow', year: 2021, mediaType: 'movie' },
      { title: 'Shang-Chi and the Legend of the Ten Rings', year: 2021, mediaType: 'movie' },
      { title: 'Eternals', year: 2021, mediaType: 'movie' },
      { title: 'Spider-Man: No Way Home', year: 2021, mediaType: 'movie' },
      { title: 'Doctor Strange in the Multiverse of Madness', year: 2022, mediaType: 'movie' },
      { title: 'Thor: Love and Thunder', year: 2022, mediaType: 'movie' },
      { title: 'Black Panther: Wakanda Forever', year: 2022, mediaType: 'movie' },
      { title: 'Ant-Man and the Wasp: Quantumania', year: 2023, mediaType: 'movie' },
      { title: 'Guardians of the Galaxy Vol. 3', year: 2023, mediaType: 'movie' },
      { title: 'The Marvels', year: 2023, mediaType: 'movie' },
      { title: 'Deadpool & Wolverine', year: 2024, mediaType: 'movie' },
      // Disney+ series
      { title: 'WandaVision', year: 2021, mediaType: 'tv' },
      { title: 'The Falcon and the Winter Soldier', year: 2021, mediaType: 'tv' },
      { title: 'Loki', year: 2021, mediaType: 'tv' },
      { title: 'Hawkeye', year: 2021, mediaType: 'tv' },
      { title: 'Moon Knight', year: 2022, mediaType: 'tv' },
      { title: 'Ms. Marvel', year: 2022, mediaType: 'tv' },
      { title: 'She-Hulk: Attorney at Law', year: 2022, mediaType: 'tv' },
      { title: 'Secret Invasion', year: 2023, mediaType: 'tv' },
      { title: 'Agatha All Along', year: 2024, mediaType: 'tv' },
    ],
  },

  // 9 -----------------------------------------------------------------------
  {
    slug: 'mission-impossible',
    title: 'Mission Impossible',
    type: 'saga',
    accessibility_level: 'accessible',
    short_description: 'Les 8 films Mission Impossible avec Tom Cruise, dans l\'ordre chronologique.',
    is_open: false,
    display_order: 9,
    items: [
      { title: 'Mission: Impossible', year: 1996, mediaType: 'movie' },
      { title: 'Mission: Impossible 2', year: 2000, mediaType: 'movie' },
      { title: 'Mission: Impossible III', year: 2006, mediaType: 'movie' },
      { title: 'Mission: Impossible - Ghost Protocol', year: 2011, mediaType: 'movie' },
      { title: 'Mission: Impossible - Rogue Nation', year: 2015, mediaType: 'movie' },
      { title: 'Mission: Impossible - Fallout', year: 2018, mediaType: 'movie' },
      { title: 'Mission: Impossible - Dead Reckoning Part One', year: 2023, mediaType: 'movie' },
      { title: 'Mission: Impossible - The Final Reckoning', year: 2025, mediaType: 'movie' },
    ],
  },

  // 10 ----------------------------------------------------------------------
  {
    slug: 'nouvelle-vague-10-essentiels',
    title: 'Nouvelle Vague, les 10 essentiels',
    type: 'movement',
    accessibility_level: 'curieux',
    short_description: "10 films représentatifs de la Nouvelle Vague française (1959-1973). Sélection éditoriale.",
    editorial_note: "Entre 1959 et 1973, des cinéastes français ont rompu avec les conventions du cinéma de studio. Truffaut, Godard, Varda, Resnais : chaque film est un geste de liberté autant qu'une oeuvre.",
    is_open: false,
    display_order: 10,
    items: [
      { title: 'The 400 Blows', year: 1959, mediaType: 'movie' },
      { title: 'Breathless', year: 1960, mediaType: 'movie' },
      { title: 'Hiroshima Mon Amour', year: 1959, mediaType: 'movie' },
      { title: 'Cleo from 5 to 7', year: 1962, mediaType: 'movie' },
      { title: 'Jules and Jim', year: 1962, mediaType: 'movie' },
      { title: 'My Life to Live', year: 1962, mediaType: 'movie' },
      { title: 'Contempt', year: 1963, mediaType: 'movie' },
      { title: 'Band of Outsiders', year: 1964, mediaType: 'movie' },
      { title: 'Pierrot le Fou', year: 1965, mediaType: 'movie' },
      { title: 'The Mother and the Whore', year: 1973, mediaType: 'movie' },
    ],
  },

  // 11 ----------------------------------------------------------------------
  {
    slug: 'new-hollywood-10-fondateurs',
    title: 'New Hollywood, les 10 fondateurs',
    type: 'movement',
    accessibility_level: 'curieux',
    short_description: "Les 10 films qui ont fondé le Nouvel Hollywood entre 1967 et 1980.",
    editorial_note: "Entre 1967 et 1980, Hollywood a rompu avec ses conventions classiques. Penn, Nichols, Hopper, Coppola, Scorsese, Allen : ces 10 films ont posé les bases d'un cinéma américain adulte et ambigu.",
    is_open: false,
    display_order: 11,
    items: [
      { title: 'Bonnie and Clyde', year: 1967, mediaType: 'movie' },
      { title: 'The Graduate', year: 1967, mediaType: 'movie' },
      { title: 'Easy Rider', year: 1969, mediaType: 'movie' },
      { title: 'The Godfather', year: 1972, mediaType: 'movie' },
      { title: 'Chinatown', year: 1974, mediaType: 'movie' },
      { title: 'Taxi Driver', year: 1976, mediaType: 'movie' },
      { title: 'Annie Hall', year: 1977, mediaType: 'movie' },
      { title: 'Close Encounters of the Third Kind', year: 1977, mediaType: 'movie' },
      { title: 'Apocalypse Now', year: 1979, mediaType: 'movie' },
      { title: 'Raging Bull', year: 1980, mediaType: 'movie' },
    ],
  },

  // 12 ----------------------------------------------------------------------
  {
    slug: 'film-noir-americain-10-classiques',
    title: 'Film noir américain, les 10 classiques',
    type: 'subgenre',
    accessibility_level: 'curieux',
    short_description: "Les 10 films qui ont défini le film noir américain entre 1941 et 1958.",
    editorial_note: "Le film noir est moins un genre qu'une humeur : désillusion, femmes fatales, lumières d'ombre. Ces dix films en ont posé le vocabulaire définitif.",
    is_open: false,
    display_order: 12,
    items: [
      { title: 'The Maltese Falcon', year: 1941, mediaType: 'movie' },
      { title: 'Double Indemnity', year: 1944, mediaType: 'movie' },
      { title: 'Laura', year: 1944, mediaType: 'movie' },
      { title: 'Notorious', year: 1946, mediaType: 'movie' },
      { title: 'The Big Sleep', year: 1946, mediaType: 'movie' },
      { title: 'The Lady from Shanghai', year: 1947, mediaType: 'movie' },
      { title: 'The Third Man', year: 1949, mediaType: 'movie' },
      { title: 'Sunset Blvd.', year: 1950, mediaType: 'movie' },
      { title: 'Kiss Me Deadly', year: 1955, mediaType: 'movie' },
      { title: 'Touch of Evil', year: 1958, mediaType: 'movie' },
    ],
  },

  // 13 ----------------------------------------------------------------------
  {
    slug: 'palme-dor-integrale',
    title: "Palme d'or, l'intégrale",
    type: 'prize_complete',
    accessibility_level: 'curieux',
    short_description: "Tous les lauréats de la Palme d'or de Cannes depuis 1955. Collection ouverte.",
    is_open: true,
    display_order: 13,
    items: [
      { title: 'Marty', year: 1955, mediaType: 'movie' },
      { title: 'The Silent World', year: 1956, mediaType: 'movie' },
      { title: 'Friendly Persuasion', year: 1956, mediaType: 'movie' },
      { title: 'The Cranes Are Flying', year: 1957, mediaType: 'movie' },
      { title: 'Black Orpheus', year: 1959, mediaType: 'movie' },
      { title: 'La Dolce Vita', year: 1960, mediaType: 'movie' },
      { title: 'Viridiana', year: 1961, mediaType: 'movie' },
      { title: 'Une aussi longue absence', year: 1961, mediaType: 'movie' },
      { title: 'O Pagador de Promessas', year: 1962, mediaType: 'movie' },
      { title: 'The Leopard', year: 1963, mediaType: 'movie' },
      { title: 'The Umbrellas of Cherbourg', year: 1964, mediaType: 'movie' },
      { title: 'The Knack ...and How to Get It', year: 1965, mediaType: 'movie' },
      { title: 'A Man and a Woman', year: 1966, mediaType: 'movie' },
      { title: 'Signore & Signori', year: 1966, mediaType: 'movie' },
      { title: 'Blow-Up', year: 1966, mediaType: 'movie' },
      { title: 'If....', year: 1968, mediaType: 'movie' },
      { title: 'M*A*S*H', year: 1970, mediaType: 'movie' },
      { title: 'The Go-Between', year: 1971, mediaType: 'movie' },
      { title: 'The Hireling', year: 1973, mediaType: 'movie' },
      { title: 'Scarecrow', year: 1973, mediaType: 'movie' },
      { title: 'The Conversation', year: 1974, mediaType: 'movie' },
      { title: 'Chronicle of the Years of Fire', year: 1975, mediaType: 'movie' },
      { title: 'Taxi Driver', year: 1976, mediaType: 'movie' },
      { title: 'Padre Padrone', year: 1977, mediaType: 'movie' },
      { title: 'The Tree of Wooden Clogs', year: 1978, mediaType: 'movie' },
      { title: 'Apocalypse Now', year: 1979, mediaType: 'movie' },
      { title: 'The Tin Drum', year: 1979, mediaType: 'movie' },
      { title: 'Kagemusha', year: 1980, mediaType: 'movie' },
      { title: 'All That Jazz', year: 1979, mediaType: 'movie' },
      { title: 'Man of Iron', year: 1981, mediaType: 'movie' },
      { title: 'Missing', year: 1982, mediaType: 'movie' },
      { title: 'Yol', year: 1982, mediaType: 'movie' },
      { title: 'The Ballad of Narayama', year: 1983, mediaType: 'movie' },
      { title: 'Paris, Texas', year: 1984, mediaType: 'movie' },
      { title: 'When Father Was Away on Business', year: 1985, mediaType: 'movie' },
      { title: 'The Mission', year: 1986, mediaType: 'movie' },
      { title: 'Under the Sun of Satan', year: 1987, mediaType: 'movie' },
      { title: 'Pelle the Conqueror', year: 1987, mediaType: 'movie' },
      { title: 'Sex, Lies, and Videotape', year: 1989, mediaType: 'movie' },
      { title: 'Wild at Heart', year: 1990, mediaType: 'movie' },
      { title: 'Barton Fink', year: 1991, mediaType: 'movie' },
      { title: 'The Best Intentions', year: 1992, mediaType: 'movie' },
      { title: 'The Piano', year: 1993, mediaType: 'movie' },
      { title: 'Farewell My Concubine', year: 1993, mediaType: 'movie' },
      { title: 'Pulp Fiction', year: 1994, mediaType: 'movie' },
      { title: 'Underground', year: 1995, mediaType: 'movie' },
      { title: 'Secrets & Lies', year: 1996, mediaType: 'movie' },
      { title: 'Taste of Cherry', year: 1997, mediaType: 'movie' },
      { title: 'The Eel', year: 1997, mediaType: 'movie' },
      { title: 'Eternity and a Day', year: 1998, mediaType: 'movie' },
      { title: 'Rosetta', year: 1999, mediaType: 'movie' },
      { title: 'Dancer in the Dark', year: 2000, mediaType: 'movie' },
      { title: 'The Son\'s Room', year: 2001, mediaType: 'movie' },
      { title: 'The Pianist', year: 2002, mediaType: 'movie' },
      { title: 'Elephant', year: 2003, mediaType: 'movie' },
      { title: 'Fahrenheit 9/11', year: 2004, mediaType: 'movie' },
      { title: 'The Child', year: 2005, mediaType: 'movie' },
      { title: 'The Wind That Shakes the Barley', year: 2006, mediaType: 'movie' },
      { title: '4 Months, 3 Weeks and 2 Days', year: 2007, mediaType: 'movie' },
      { title: 'The Class', year: 2008, mediaType: 'movie' },
      { title: 'The White Ribbon', year: 2009, mediaType: 'movie' },
      { title: 'Uncle Boonmee Who Can Recall His Past Lives', year: 2010, mediaType: 'movie' },
      { title: 'The Tree of Life', year: 2011, mediaType: 'movie' },
      { title: 'Amour', year: 2012, mediaType: 'movie' },
      { title: 'Blue Is the Warmest Colour', year: 2013, mediaType: 'movie' },
      { title: 'Winter Sleep', year: 2014, mediaType: 'movie' },
      { title: 'Dheepan', year: 2015, mediaType: 'movie' },
      { title: 'I, Daniel Blake', year: 2016, mediaType: 'movie' },
      { title: 'The Square', year: 2017, mediaType: 'movie' },
      { title: 'Shoplifters', year: 2018, mediaType: 'movie' },
      { title: 'Parasite', year: 2019, mediaType: 'movie' },
      { title: 'Titane', year: 2021, mediaType: 'movie' },
      { title: 'Triangle of Sadness', year: 2022, mediaType: 'movie' },
      { title: 'Anatomy of a Fall', year: 2023, mediaType: 'movie' },
      { title: 'Anora', year: 2024, mediaType: 'movie' },
    ],
  },

  // 15 ----------------------------------------------------------------------
  {
    slug: 'oscar-meilleur-film-integrale',
    title: "Oscar du meilleur film, l'intégrale",
    type: 'prize_complete',
    accessibility_level: 'accessible',
    short_description: "Tous les lauréats de l'Oscar du meilleur film depuis 1927. ~97 films.",
    is_open: true,
    display_order: 14,
    items: [
      { title: 'Wings', year: 1927, mediaType: 'movie' },
      { title: 'The Broadway Melody', year: 1929, mediaType: 'movie' },
      { title: 'All Quiet on the Western Front', year: 1930, mediaType: 'movie' },
      { title: 'Cimarron', year: 1931, mediaType: 'movie' },
      { title: 'Grand Hotel', year: 1932, mediaType: 'movie' },
      { title: 'Cavalcade', year: 1933, mediaType: 'movie' },
      { title: 'It Happened One Night', year: 1934, mediaType: 'movie' },
      { title: 'Mutiny on the Bounty', year: 1935, mediaType: 'movie' },
      { title: 'The Great Ziegfeld', year: 1936, mediaType: 'movie' },
      { title: 'The Life of Emile Zola', year: 1937, mediaType: 'movie' },
      { title: "You Can't Take It with You", year: 1938, mediaType: 'movie' },
      { title: 'Gone with the Wind', year: 1939, mediaType: 'movie' },
      { title: 'Rebecca', year: 1940, mediaType: 'movie' },
      { title: 'How Green Was My Valley', year: 1941, mediaType: 'movie' },
      { title: 'Mrs. Miniver', year: 1942, mediaType: 'movie' },
      { title: 'Casablanca', year: 1942, mediaType: 'movie' },
      { title: 'Going My Way', year: 1944, mediaType: 'movie' },
      { title: 'The Lost Weekend', year: 1945, mediaType: 'movie' },
      { title: 'The Best Years of Our Lives', year: 1946, mediaType: 'movie' },
      { title: "Gentleman's Agreement", year: 1947, mediaType: 'movie' },
      { title: 'Hamlet', year: 1948, mediaType: 'movie' },
      { title: "All the King's Men", year: 1949, mediaType: 'movie' },
      { title: 'All About Eve', year: 1950, mediaType: 'movie' },
      { title: 'An American in Paris', year: 1951, mediaType: 'movie' },
      { title: 'The Greatest Show on Earth', year: 1952, mediaType: 'movie' },
      { title: 'From Here to Eternity', year: 1953, mediaType: 'movie' },
      { title: 'On the Waterfront', year: 1954, mediaType: 'movie' },
      { title: 'Marty', year: 1955, mediaType: 'movie' },
      { title: 'Around the World in 80 Days', year: 1956, mediaType: 'movie' },
      { title: 'The Bridge on the River Kwai', year: 1957, mediaType: 'movie' },
      { title: 'Gigi', year: 1958, mediaType: 'movie' },
      { title: 'Ben-Hur', year: 1959, mediaType: 'movie' },
      { title: 'The Apartment', year: 1960, mediaType: 'movie' },
      { title: 'West Side Story', year: 1961, mediaType: 'movie' },
      { title: 'Lawrence of Arabia', year: 1962, mediaType: 'movie' },
      { title: 'Tom Jones', year: 1963, mediaType: 'movie' },
      { title: 'My Fair Lady', year: 1964, mediaType: 'movie' },
      { title: 'The Sound of Music', year: 1965, mediaType: 'movie' },
      { title: 'A Man for All Seasons', year: 1966, mediaType: 'movie' },
      { title: 'In the Heat of the Night', year: 1967, mediaType: 'movie' },
      { title: 'Oliver!', year: 1968, mediaType: 'movie' },
      { title: 'Midnight Cowboy', year: 1969, mediaType: 'movie' },
      { title: 'Patton', year: 1970, mediaType: 'movie' },
      { title: 'The French Connection', year: 1971, mediaType: 'movie' },
      { title: 'The Godfather', year: 1972, mediaType: 'movie' },
      { title: 'The Sting', year: 1973, mediaType: 'movie' },
      { title: 'The Godfather Part II', year: 1974, mediaType: 'movie' },
      { title: "One Flew Over the Cuckoo's Nest", year: 1975, mediaType: 'movie' },
      { title: 'Rocky', year: 1976, mediaType: 'movie' },
      { title: 'Annie Hall', year: 1977, mediaType: 'movie' },
      { title: 'The Deer Hunter', year: 1978, mediaType: 'movie' },
      { title: 'Kramer vs. Kramer', year: 1979, mediaType: 'movie' },
      { title: 'Ordinary People', year: 1980, mediaType: 'movie' },
      { title: 'Chariots of Fire', year: 1981, mediaType: 'movie' },
      { title: 'Gandhi', year: 1982, mediaType: 'movie' },
      { title: 'Terms of Endearment', year: 1983, mediaType: 'movie' },
      { title: 'Amadeus', year: 1984, mediaType: 'movie' },
      { title: 'Out of Africa', year: 1985, mediaType: 'movie' },
      { title: 'Platoon', year: 1986, mediaType: 'movie' },
      { title: 'The Last Emperor', year: 1987, mediaType: 'movie' },
      { title: 'Rain Man', year: 1988, mediaType: 'movie' },
      { title: 'Driving Miss Daisy', year: 1989, mediaType: 'movie' },
      { title: 'Dances with Wolves', year: 1990, mediaType: 'movie' },
      { title: 'The Silence of the Lambs', year: 1991, mediaType: 'movie' },
      { title: 'Unforgiven', year: 1992, mediaType: 'movie' },
      { title: "Schindler's List", year: 1993, mediaType: 'movie' },
      { title: 'Forrest Gump', year: 1994, mediaType: 'movie' },
      { title: 'Braveheart', year: 1995, mediaType: 'movie' },
      { title: 'The English Patient', year: 1996, mediaType: 'movie' },
      { title: 'Titanic', year: 1997, mediaType: 'movie' },
      { title: 'Shakespeare in Love', year: 1998, mediaType: 'movie' },
      { title: 'American Beauty', year: 1999, mediaType: 'movie' },
      { title: 'Gladiator', year: 2000, mediaType: 'movie' },
      { title: 'A Beautiful Mind', year: 2001, mediaType: 'movie' },
      { title: 'Chicago', year: 2002, mediaType: 'movie' },
      { title: 'The Lord of the Rings: The Return of the King', year: 2003, mediaType: 'movie' },
      { title: 'Million Dollar Baby', year: 2004, mediaType: 'movie' },
      { title: 'Crash', year: 2004, mediaType: 'movie' },
      { title: 'The Departed', year: 2006, mediaType: 'movie' },
      { title: 'No Country for Old Men', year: 2007, mediaType: 'movie' },
      { title: 'Slumdog Millionaire', year: 2008, mediaType: 'movie' },
      { title: 'The Hurt Locker', year: 2008, mediaType: 'movie' },
      { title: "The King's Speech", year: 2010, mediaType: 'movie' },
      { title: 'The Artist', year: 2011, mediaType: 'movie' },
      { title: 'Argo', year: 2012, mediaType: 'movie' },
      { title: '12 Years a Slave', year: 2013, mediaType: 'movie' },
      { title: 'Birdman', year: 2014, mediaType: 'movie' },
      { title: 'Spotlight', year: 2015, mediaType: 'movie' },
      { title: 'Moonlight', year: 2016, mediaType: 'movie' },
      { title: 'The Shape of Water', year: 2017, mediaType: 'movie' },
      { title: 'Green Book', year: 2018, mediaType: 'movie' },
      { title: 'Parasite', year: 2019, mediaType: 'movie' },
      { title: 'Nomadland', year: 2020, mediaType: 'movie' },
      { title: 'CODA', year: 2021, mediaType: 'movie' },
      { title: 'Everything Everywhere All at Once', year: 2022, mediaType: 'movie' },
      { title: 'Oppenheimer', year: 2023, mediaType: 'movie' },
      { title: 'Anora', year: 2024, mediaType: 'movie' },
    ],
  },

  // 16 ----------------------------------------------------------------------
  {
    slug: 'cinema-coreen-10-incontournables',
    title: 'Cinéma coréen, les 10 incontournables',
    type: 'national_cinema',
    accessibility_level: 'accessible',
    short_description: "10 films coréens incontournables, de 2003 à aujourd'hui. Portée par la notoriété de Parasite.",
    is_open: false,
    display_order: 15,
    items: [
      { title: 'Memories of Murder', year: 2003, mediaType: 'movie' },
      { title: 'Oldboy', year: 2003, mediaType: 'movie' },
      { title: 'The Host', year: 2006, mediaType: 'movie' },
      { title: 'Mother', year: 2009, mediaType: 'movie' },
      { title: 'The Housemaid', year: 2010, mediaType: 'movie' },
      { title: 'Pieta', year: 2012, mediaType: 'movie' },
      { title: 'The Handmaiden', year: 2016, mediaType: 'movie' },
      { title: 'Burning', year: 2018, mediaType: 'movie' },
      { title: 'Parasite', year: 2019, mediaType: 'movie' },
      { title: 'Decision to Leave', year: 2022, mediaType: 'movie' },
    ],
  },

  // 17 ----------------------------------------------------------------------
  {
    slug: 'films-adolescence',
    title: "Films sur l'adolescence",
    type: 'thematic',
    accessibility_level: 'accessible',
    short_description: "20 films sur l'expérience adolescente, de nationalités et d'époques variées.",
    editorial_note: "L'adolescence vue par les meilleurs cinéastes : une expérience universelle, des angles tous différents. Des 400 coups (1959) à Aftersun (2022), ce sont 60 ans de regards sur cette période.",
    is_open: false,
    display_order: 16,
    items: [
      { title: 'The 400 Blows', year: 1959, mediaType: 'movie' },
      { title: 'Grease', year: 1978, mediaType: 'movie' },
      { title: 'The Outsiders', year: 1983, mediaType: 'movie' },
      { title: 'The Breakfast Club', year: 1985, mediaType: 'movie' },
      { title: 'Stand by Me', year: 1986, mediaType: 'movie' },
      { title: "Ferris Bueller's Day Off", year: 1986, mediaType: 'movie' },
      { title: 'Boyz n the Hood', year: 1991, mediaType: 'movie' },
      { title: 'Dazed and Confused', year: 1993, mediaType: 'movie' },
      { title: 'Kids', year: 1995, mediaType: 'movie' },
      { title: 'Trainspotting', year: 1996, mediaType: 'movie' },
      { title: 'Elephant', year: 2003, mediaType: 'movie' },
      { title: 'Thirteen', year: 2003, mediaType: 'movie' },
      { title: 'Superbad', year: 2007, mediaType: 'movie' },
      { title: 'The Perks of Being a Wallflower', year: 2012, mediaType: 'movie' },
      { title: 'The Spectacular Now', year: 2013, mediaType: 'movie' },
      { title: 'Boyhood', year: 2014, mediaType: 'movie' },
      { title: 'Lady Bird', year: 2017, mediaType: 'movie' },
      { title: 'Eighth Grade', year: 2018, mediaType: 'movie' },
      { title: 'Mid90s', year: 2018, mediaType: 'movie' },
      { title: 'Aftersun', year: 2022, mediaType: 'movie' },
    ],
  },

  // 18 ----------------------------------------------------------------------
  {
    slug: 'cinema-espace-10-films',
    title: 'Cinéma et espace, 10 films incontournables',
    type: 'thematic',
    accessibility_level: 'accessible',
    short_description: "10 films posant les questions essentielles sur l'espace, l'exploration et la solitude cosmique.",
    is_open: false,
    display_order: 17,
    items: [
      { title: '2001: A Space Odyssey', year: 1968, mediaType: 'movie' },
      { title: 'Alien', year: 1979, mediaType: 'movie' },
      { title: 'The Right Stuff', year: 1983, mediaType: 'movie' },
      { title: 'Apollo 13', year: 1995, mediaType: 'movie' },
      { title: 'Contact', year: 1997, mediaType: 'movie' },
      { title: 'Sunshine', year: 2007, mediaType: 'movie' },
      { title: 'Gravity', year: 2013, mediaType: 'movie' },
      { title: 'Interstellar', year: 2014, mediaType: 'movie' },
      { title: 'The Martian', year: 2015, mediaType: 'movie' },
      { title: 'First Man', year: 2018, mediaType: 'movie' },
    ],
  },

  // 19 ----------------------------------------------------------------------
  {
    slug: 'cinema-memes-pantheon',
    title: 'Cinéma et mèmes, le panthéon',
    type: 'thematic',
    accessibility_level: 'accessible',
    short_description: "~30 films dont des scènes ou répliques ont colonisé la mémoire collective d'internet.",
    editorial_note: "Pas une liste des 'meilleurs' films, mais des films qui ont colonisé la mémoire collective. Des films qui existent autant dans les mèmes que sur les écrans.",
    is_open: false,
    display_order: 18,
    items: [
      { title: 'Star Wars', year: 1977, mediaType: 'movie' },
      { title: 'Monty Python and the Holy Grail', year: 1975, mediaType: 'movie' },
      { title: 'Back to the Future', year: 1985, mediaType: 'movie' },
      { title: 'Die Hard', year: 1988, mediaType: 'movie' },
      { title: 'When Harry Met Sally...', year: 1989, mediaType: 'movie' },
      { title: 'The Silence of the Lambs', year: 1991, mediaType: 'movie' },
      { title: 'The Godfather', year: 1972, mediaType: 'movie' },
      { title: 'Scarface', year: 1983, mediaType: 'movie' },
      { title: 'Pulp Fiction', year: 1994, mediaType: 'movie' },
      { title: 'Forrest Gump', year: 1994, mediaType: 'movie' },
      { title: 'The Lion King', year: 1994, mediaType: 'movie' },
      { title: 'Toy Story', year: 1995, mediaType: 'movie' },
      { title: 'Titanic', year: 1997, mediaType: 'movie' },
      { title: 'The Big Lebowski', year: 1998, mediaType: 'movie' },
      { title: 'The Matrix', year: 1999, mediaType: 'movie' },
      { title: 'Fight Club', year: 1999, mediaType: 'movie' },
      { title: 'Gladiator', year: 2000, mediaType: 'movie' },
      { title: 'Zoolander', year: 2001, mediaType: 'movie' },
      { title: 'Shrek', year: 2001, mediaType: 'movie' },
      { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, mediaType: 'movie' },
      { title: 'American Psycho', year: 2000, mediaType: 'movie' },
      { title: 'Napoleon Dynamite', year: 2004, mediaType: 'movie' },
      { title: 'Mean Girls', year: 2004, mediaType: 'movie' },
      { title: 'Anchorman: The Legend of Ron Burgundy', year: 2004, mediaType: 'movie' },
      { title: '300', year: 2006, mediaType: 'movie' },
      { title: 'The Dark Knight', year: 2008, mediaType: 'movie' },
      { title: 'The Shining', year: 1980, mediaType: 'movie' },
      { title: 'Indiana Jones and the Raiders of the Lost Ark', year: 1981, mediaType: 'movie' },
      { title: 'Inception', year: 2010, mediaType: 'movie' },
      { title: 'Spider-Man: Into the Spider-Verse', year: 2018, mediaType: 'movie' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function findTmdbId(
  title: string,
  year: number,
  mediaType: MediaType,
): Promise<number | null> {
  try {
    const path = mediaType === 'movie' ? '/search/movie' : '/search/tv'
    const params: Record<string, string> = { query: title }
    if (mediaType === 'movie') {
      params.year = String(year)
    } else {
      params.first_air_date_year = String(year)
    }
    const result = await tmdbFetch<{ results: Array<{ id: number }> }>(path, params)
    return result.results[0]?.id ?? null
  } catch {
    return null
  }
}

type PayloadInstance = Awaited<ReturnType<typeof getPayload>>

async function upsertMediaItem(
  payload: PayloadInstance,
  tmdbId: number,
  mediaType: MediaType,
  filmTypeId: number,
  seriesTypeId: number,
): Promise<number | null> {
  try {
    const mediaTypeId = mediaType === 'movie' ? filmTypeId : seriesTypeId

    // Check existing
    const existing = await payload.find({
      collection: 'media-items',
      where: {
        and: [
          { tmdb_id: { equals: tmdbId } },
          { media_type: { equals: mediaTypeId } },
        ],
      },
      limit: 1,
    })

    const detail = mediaType === 'movie'
      ? await fetchMovieDetail(tmdbId)
      : await fetchTvDetail(tmdbId)
    const normalized = mediaType === 'movie'
      ? normalizeMovie(detail as Parameters<typeof normalizeMovie>[0])
      : normalizeTv(detail as Parameters<typeof normalizeTv>[0])

    const data = { ...normalized, media_type: mediaTypeId }

    let docId: number

    if (existing.docs.length > 0) {
      const existingId = existing.docs[0]!.id as number
      await payload.update({
        collection: 'media-items',
        id: existingId,
        data,
      })
      docId = existingId
    } else {
      const created = await payload.create({
        collection: 'media-items',
        data,
      })
      docId = created.id as number
    }

    // Upsert TMDB external ID
    const existingExtId = await payload.find({
      collection: 'external-ids',
      where: {
        and: [
          { provider: { equals: 'tmdb' } },
          { external_id: { equals: String(tmdbId) } },
        ],
      },
      limit: 1,
    })
    if (existingExtId.docs.length === 0) {
      await payload.create({
        collection: 'external-ids',
        data: { media_item: docId, provider: 'tmdb', external_id: String(tmdbId) },
      })
    }

    // Upsert IMDb external ID if available
    if (normalized.imdb_id) {
      const existingImdb = await payload.find({
        collection: 'external-ids',
        where: {
          and: [
            { provider: { equals: 'imdb' } },
            { external_id: { equals: normalized.imdb_id } },
          ],
        },
        limit: 1,
      })
      if (existingImdb.docs.length === 0) {
        await payload.create({
          collection: 'external-ids',
          data: { media_item: docId, provider: 'imdb', external_id: normalized.imdb_id },
        })
      }
    }

    return docId
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`  [ERROR] upsertMediaItem tmdbId=${tmdbId}: ${msg}`)
    return null
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  const payload = await getPayload({ config })

  // Get media-type IDs
  const filmTypeResult = await payload.find({
    collection: 'media-types',
    where: { slug: { equals: 'film' } },
    limit: 1,
  })
  const seriesTypeResult = await payload.find({
    collection: 'media-types',
    where: { slug: { equals: 'series' } },
    limit: 1,
  })

  if (!filmTypeResult.docs[0] || !seriesTypeResult.docs[0]) {
    throw new Error("media-types 'film' or 'series' not found. Run seed:media-types first.")
  }

  const filmTypeId = filmTypeResult.docs[0].id as number
  const seriesTypeId = seriesTypeResult.docs[0].id as number

  console.log(`Media types: film=${filmTypeId}, series=${seriesTypeId}`)

  for (const collectionDef of COLLECTIONS) {
    console.log(`\n=== ${collectionDef.title} ===`)

    // Find or create collection
    const existingCollection = await payload.find({
      collection: 'collections',
      where: { slug: { equals: collectionDef.slug } },
      limit: 1,
    })

    let collectionId: number
    const collectionData = {
      slug: collectionDef.slug,
      title: collectionDef.title,
      type: collectionDef.type,
      accessibility_level: collectionDef.accessibility_level,
      short_description: collectionDef.short_description,
      ...(collectionDef.editorial_note ? { editorial_note: collectionDef.editorial_note } : {}),
      is_open: collectionDef.is_open,
      is_published: true,
      display_order: collectionDef.display_order,
    }

    if (existingCollection.docs.length > 0) {
      const existingId = existingCollection.docs[0]!.id as number
      await payload.update({
        collection: 'collections',
        id: existingId,
        data: collectionData,
      })
      collectionId = existingId
      console.log(`  Collection updated (id=${collectionId})`)
    } else {
      const created = await payload.create({
        collection: 'collections',
        data: collectionData,
      })
      collectionId = created.id as number
      console.log(`  Collection created (id=${collectionId})`)
    }

    // Process items
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const item of collectionDef.items) {
      await sleep(150)

      // Resolve TMDB ID
      let tmdbId = item.tmdbId
      if (!tmdbId) {
        tmdbId = (await findTmdbId(item.title, item.year, item.mediaType)) ?? undefined
        if (!tmdbId) {
          console.warn(`  [SKIP] "${item.title}" (${item.year}) — not found on TMDB`)
          errorCount++
          continue
        }
      }

      // Upsert media item
      await sleep(150)
      const mediaItemId = await upsertMediaItem(payload, tmdbId, item.mediaType, filmTypeId, seriesTypeId)
      if (!mediaItemId) {
        errorCount++
        continue
      }

      // Check if collection-item link already exists
      const existingLink = await payload.find({
        collection: 'collection-items',
        where: {
          and: [
            { collection: { equals: collectionId as unknown as string } },
            { media_item: { equals: mediaItemId as unknown as string } },
          ],
        },
        limit: 1,
      })

      if (existingLink.docs.length > 0) {
        skipCount++
      } else {
        await payload.create({
          collection: 'collection-items',
          data: {
            collection: collectionId as unknown as number,
            media_item: mediaItemId as unknown as number,
          },
        })
        successCount++
      }

      process.stdout.write('.')
    }

    console.log(`\n  Done: ${successCount} added, ${skipCount} skipped, ${errorCount} errors`)
  }

  console.log('\n\nSeed complete.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
