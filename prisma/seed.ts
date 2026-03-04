import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.drillLibrary.deleteMany();
  await prisma.playbook.deleteMany();
  await prisma.video.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // Users
  const brandon = await prisma.user.create({
    data: { name: "Brandon Loredo", email: "bloredo22@gmail.com", password: hash("MaverickCoach1!"), role: "admin", position: null },
  });
  const coach2 = await prisma.user.create({
    data: { name: "Marcus Thompson", email: "mthompson@mavericks.com", password: hash("Coach2024!"), role: "coach", position: null },
  });
  const coach3 = await prisma.user.create({
    data: { name: "Derek Williams", email: "dwilliams@mavericks.com", password: hash("Coach2024!"), role: "coach", position: null },
  });

  const players = await Promise.all([
    prisma.user.create({ data: { name: "Jaylen Carter", email: "jcarter@mavericks.com", password: hash("Player2024!"), role: "player", position: "QB", jerseyNumber: 7 } }),
    prisma.user.create({ data: { name: "Marcus Davis", email: "mdavis@mavericks.com", password: hash("Player2024!"), role: "player", position: "RB", jerseyNumber: 22 } }),
    prisma.user.create({ data: { name: "Darius Johnson", email: "djohnson@mavericks.com", password: hash("Player2024!"), role: "player", position: "LB", jerseyNumber: 55 } }),
    prisma.user.create({ data: { name: "Tre Williams", email: "twilliams@mavericks.com", password: hash("Player2024!"), role: "player", position: "CB", jerseyNumber: 1 } }),
    prisma.user.create({ data: { name: "Andre Smith", email: "asmith@mavericks.com", password: hash("Player2024!"), role: "player", position: "WR", jerseyNumber: 11 } }),
  ]);

  // Quizzes
  const quiz1 = await prisma.quiz.create({
    data: {
      title: "Defense Coverage Quiz",
      description: "Test your knowledge of defensive coverages",
      category: "defense",
      difficulty: "medium",
      createdBy: brandon.id,
      isPublished: true,
      questions: {
        create: [
          { type: "multiple_choice", text: "In Cover 2, how many safeties are deep?", options: JSON.stringify(["1", "2", "3", "4"]), correctAnswer: "2", explanation: "Cover 2 has two safeties splitting the deep field in half.", sortOrder: 0 },
          { type: "multiple_choice", text: "What coverage has a single high safety?", options: JSON.stringify(["Cover 0", "Cover 1", "Cover 2", "Cover 4"]), correctAnswer: "Cover 1", explanation: "Cover 1 features a single free safety in the deep middle.", sortOrder: 1 },
          { type: "multiple_choice", text: "In Cover 3, how many defenders cover deep zones?", options: JSON.stringify(["1", "2", "3", "4"]), correctAnswer: "3", explanation: "Cover 3 divides the deep field into thirds with 3 defenders.", sortOrder: 2 },
          { type: "multiple_choice", text: "Cover 0 means:", options: JSON.stringify(["No deep safety", "Zero blitz with man coverage", "Both A and B", "Zone coverage"]), correctAnswer: "Both A and B", explanation: "Cover 0 is pure man coverage with no deep safety help — all-out pressure.", sortOrder: 3 },
          { type: "multiple_choice", text: "Which coverage is best against the run?", options: JSON.stringify(["Cover 2", "Cover 3", "Cover 1", "Cover 0"]), correctAnswer: "Cover 1", explanation: "Cover 1 puts 7 defenders near the box while still having deep help.", sortOrder: 4 },
        ],
      },
    },
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      title: "Formation ID Quiz",
      description: "Identify offensive formations",
      category: "offense",
      difficulty: "easy",
      createdBy: brandon.id,
      isPublished: true,
      questions: {
        create: [
          { type: "multiple_choice", text: "How many receivers are in a '3x1' formation?", options: JSON.stringify(["2", "3", "4", "1"]), correctAnswer: "3", explanation: "3x1 means 3 receivers to one side, 1 to the other.", sortOrder: 0 },
          { type: "multiple_choice", text: "What is 'I-Formation'?", options: JSON.stringify(["Fullback and halfback behind QB", "Shotgun with two backs", "Empty backfield", "Single back offset"]), correctAnswer: "Fullback and halfback behind QB", explanation: "I-Formation lines up FB and HB directly behind the QB.", sortOrder: 1 },
          { type: "multiple_choice", text: "In 'Trips' formation, how many receivers are grouped?", options: JSON.stringify(["2", "3", "4", "1"]), correctAnswer: "3", explanation: "Trips = triple receivers to one side.", sortOrder: 2 },
          { type: "multiple_choice", text: "'Shotgun' formation means the QB is:", options: JSON.stringify(["Under center", "5 yards back", "In motion", "On the line"]), correctAnswer: "5 yards back", explanation: "Shotgun places the QB about 5 yards behind center for the snap.", sortOrder: 3 },
        ],
      },
    },
  });

  const quiz3 = await prisma.quiz.create({
    data: {
      title: "Tackling Fundamentals",
      description: "Test your tackling technique knowledge",
      category: "general",
      difficulty: "easy",
      createdBy: brandon.id,
      isPublished: true,
      questions: {
        create: [
          { type: "multiple_choice", text: "Where should your head be when tackling?", options: JSON.stringify(["Down", "To the side", "Up, eyes on target", "Doesn't matter"]), correctAnswer: "Up, eyes on target", explanation: "Always keep your head up and eyes on the ball carrier to avoid injury and make solid contact.", sortOrder: 0 },
          { type: "multiple_choice", text: "What's the proper base for a tackle?", options: JSON.stringify(["Feet together", "Wide base, knees bent", "Standing straight", "One foot forward"]), correctAnswer: "Wide base, knees bent", explanation: "A wide base with bent knees gives you power and balance.", sortOrder: 1 },
          { type: "multiple_choice", text: "What does 'buzz your feet' mean?", options: JSON.stringify(["Run fast", "Quick choppy steps before contact", "Shuffle sideways", "Jump"]), correctAnswer: "Quick choppy steps before contact", explanation: "Buzzing feet means taking quick short steps to maintain balance and adjust to the ball carrier.", sortOrder: 2 },
        ],
      },
    },
  });

  // Drills
  const drills = [
    { title: "Ladder Footwork Drill", description: "Speed and agility ladder drill for quick feet", instructions: "Set up agility ladder on flat surface\nRun through with high knees, one foot per box\nRepeat with two feet per box\nDo crossover pattern\nRest 30 seconds between sets\n5 sets of each pattern", category: "footwork", equipment: "agility ladder", atHome: true, difficulty: "easy" },
    { title: "Cone Agility Drill", description: "5-10-5 shuttle for change of direction", instructions: "Set 3 cones 5 yards apart in a line\nStart at middle cone in 3-point stance\nSprint 5 yards to the right, touch the line\nSprint 10 yards to the left, touch the line\nSprint 5 yards back to center\nRest 45 seconds, repeat 6 times", category: "agility", equipment: "cones", atHome: true, difficulty: "medium" },
    { title: "Tackle Form Drill", description: "Practice proper tackling technique on bags", instructions: "Partner holds tackle bag at chest height\nApproach with feet shoulder-width apart\nBuzz feet 3 yards out\nDrive through with shoulder, wrap arms\nDrive feet on contact\n10 reps each shoulder", category: "tackling", equipment: "tackle bag", atHome: false, difficulty: "easy" },
    { title: "Backpedal & Break Drill", description: "DB drill for coverage technique", instructions: "Start in backpedal stance\nBackpedal 10 yards at 45-degree angle\nCoach points direction — break at 45 degrees\nSprint 5 yards to the ball\nReturn to start\n8 reps", category: "footwork", equipment: "cones", atHome: false, difficulty: "medium", position: "CB" },
    { title: "Burpee & Sprint Combo", description: "Conditioning drill combining burpees and sprints", instructions: "Start at goal line\nDo 5 burpees\nSprint 20 yards\nDo 5 burpees\nSprint back\nRest 60 seconds\n4 sets", category: "conditioning", equipment: "none", atHome: true, difficulty: "hard" },
    { title: "Ball Security Drill", description: "Practice holding the ball through contact", instructions: "Tuck ball high and tight in arm\nRun through gauntlet of teammates trying to strip\nSwitch arms halfway\nCoach checks 5 points of contact\n8 reps each arm", category: "catching", equipment: "football", atHome: false, difficulty: "easy" },
    { title: "Wall Sit Endurance", description: "Build leg strength for blocking and tackling", instructions: "Find a flat wall\nSlide down until thighs are parallel to ground\nKeep back flat against wall\nHold for 45 seconds\nRest 30 seconds\n5 sets, increase hold time each week", category: "conditioning", equipment: "none", atHome: true, difficulty: "medium" },
    { title: "Mirror Drill", description: "React to partner's movements for defensive agility", instructions: "Face partner 3 yards apart\nPartner shuffles left/right randomly\nMirror their movements staying square\n30 second rounds\nSwitch roles\n6 rounds each", category: "agility", equipment: "none", atHome: true, difficulty: "medium" },
    { title: "Pass Rush Moves", description: "Practice speed rush and swim move techniques", instructions: "Line up on edge in 3-point stance\nExplode off the ball on cadence\nExecute speed rush: dip and rip inside shoulder\nReset and execute swim move\nAlternate moves\n6 reps of each", category: "blocking", equipment: "blocking sled", atHome: false, difficulty: "hard", position: "DL" },
    { title: "Route Running Precision", description: "Crisp route running for receivers", instructions: "Set up cones at 5, 10, and 15 yards\nRun curl route at 10 yards — plant and come back\nRun out route at 12 yards — sharp 90-degree cut\nRun slant at 5 yards — 45-degree break inside\nRun post at 15 yards — break to the post\n4 reps of each route", category: "footwork", equipment: "cones, football", atHome: false, difficulty: "medium", position: "WR" },
  ];

  for (const drill of drills) {
    await prisma.drillLibrary.create({ data: drill as any });
  }

  // Playbook entries
  const playbooks = [
    { title: "Cover 2 Zone", description: "Standard Cover 2 zone coverage assignments", fileUrl: "/playbook/cover2.pdf", category: "defense", section: "coverages", sortOrder: 0 },
    { title: "Cover 3 Zone", description: "Cover 3 zone with 4 underneath defenders", fileUrl: "/playbook/cover3.pdf", category: "defense", section: "coverages", sortOrder: 1 },
    { title: "Cover 1 Man", description: "Man-free coverage with single high safety", fileUrl: "/playbook/cover1.pdf", category: "defense", section: "coverages", sortOrder: 2 },
    { title: "4-2-5 Base Alignment", description: "Base defensive alignment and gap responsibilities", fileUrl: "/playbook/base-425.pdf", category: "defense", section: "formations", sortOrder: 3 },
    { title: "Inside Zone Run", description: "Inside zone blocking scheme", fileUrl: "/playbook/iz.pdf", category: "offense", section: "run game", sortOrder: 0 },
    { title: "Outside Zone Run", description: "Outside zone stretch concept", fileUrl: "/playbook/oz.pdf", category: "offense", section: "run game", sortOrder: 1 },
    { title: "Kickoff Coverage", description: "Kickoff team assignments and lanes", fileUrl: "/playbook/kickoff.pdf", category: "special_teams", section: "kickoff", sortOrder: 0 },
    { title: "Punt Protection", description: "Punt team protection assignments", fileUrl: "/playbook/punt.pdf", category: "special_teams", section: "punt", sortOrder: 1 },
  ];

  for (const pb of playbooks) {
    await prisma.playbook.create({ data: pb });
  }

  // Sample videos
  const videos = [
    { title: "Cover 2 Breakdown", description: "Film study of Cover 2 zone defense", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "game_film", position: null },
    { title: "Tackling Technique", description: "Proper tackling form and drills", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "tutorial", position: null },
    { title: "WR Route Running", description: "Route running fundamentals for receivers", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "drill", position: "WR" },
    { title: "Week 3 Highlights", description: "Season highlights reel", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "highlight", position: null },
    { title: "Scout Film - Eagles", description: "Next opponent film breakdown", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", category: "scout_film", position: null },
  ];

  for (const v of videos) {
    await prisma.video.create({ data: v });
  }

  console.log("✅ Seed data created successfully!");
  console.log(`   Admin: bloredo22@gmail.com / MaverickCoach1!`);
  console.log(`   Coaches: 2 created`);
  console.log(`   Players: ${players.length} created`);
  console.log(`   Quizzes: 3 with questions`);
  console.log(`   Drills: ${drills.length}`);
  console.log(`   Playbook entries: ${playbooks.length}`);
  console.log(`   Videos: ${videos.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
