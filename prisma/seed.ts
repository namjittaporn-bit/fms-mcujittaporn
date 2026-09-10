import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "องค์กรตัวอย่าง", nameEn: "Sample Organization" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด", roles: ["SUPER_ADMIN"] },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
  }

  // Seed sample departments
  const depts = [
    { code: "CS", nameTh: "ภาควิชาวิทยาการคอมพิวเตอร์", nameEn: "Department of Computer Science" },
    { code: "IT", nameTh: "ภาควิชาเทคโนโลยีสารสนเทศ", nameEn: "Department of Information Technology" },
    { code: "IM", nameTh: "ภาควิชาการจัดการนวัตกรรม", nameEn: "Department of Innovation Management" },
  ];
  const deptMap: Record<string, string> = {};
  for (const d of depts) {
    const dept = await prisma.department.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: d.code } },
      update: {},
      create: { tenantId: core.tenantId, code: d.code, nameTh: d.nameTh, nameEn: d.nameEn },
    });
    deptMap[d.code] = dept.id;
  }

  // Seed sample news articles
  const sampleNews = [
    {
      titleTh: "เปิดรับสมัครนักศึกษาใหม่ ประจำปีการศึกษา 2569 รอบ Portfolio",
      titleEn: "Admissions Open for Academic Year 2026 (Portfolio Round)",
      slug: "admission-portfolio-2026",
      category: "ACADEMIC" as const,
      contentTh: "คณะเทคโนโลยีและการจัดการ เปิดรับสมัครคัดเลือกบุคคลเข้าศึกษาระดับปริญญาตรี ประจำปีการศึกษา 2569 ในรอบ TCAS 1 (Portfolio) ตั้งแต่วันนี้ถึง 15 พฤศจิกายน 2569 ผู้สนใจสามารถยื่นเอกสารการสมัครและผลงานผ่านระบบออนไลน์ได้ตลอด 24 ชั่วโมง พร้อมรับทุนการศึกษาสำหรับผู้มีคะแนนสูงสุด 10 อันดับแรก",
      contentEn: "The Faculty of Technology and Management is now accepting applications for Undergraduate Admissions for Academic Year 2026 via TCAS Round 1 (Portfolio). Applications open from now until November 15, 2026 via our online admissions portal. Merit scholarships are available for the top 10 applicants.",
      coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
      isPinned: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
    },
    {
      titleTh: "ประกาศรับสมัครทุนการศึกษาเพื่อการพัฒนาศักยภาพนักศึกษา ประจำภาคเรียนที่ 1",
      titleEn: "Student Development Scholarship Applications Now Open (Semester 1)",
      slug: "student-scholarship-2026-sem1",
      category: "SCHOLARSHIP" as const,
      contentTh: "งานกิจการนักศึกษาประกาศเปิดรับสมัครทุนการศึกษาสำหรับนักศึกษาที่มีผลการเรียนดีเด่นและนักศึกษาที่มีความประพฤติดีแต่ขาดแคลนทุนทรัพย์ จำนวน 50 ทุน ทุนละ 20,000 บาท สามารถดาวน์โหลดใบสมัครและส่งเอกสารได้ที่ห้องงานกิจการนักศึกษา",
      contentEn: "The Student Affairs Department announces 50 development scholarships (20,000 THB each) for students with exceptional academic merit or financial need. Please download the application form and submit documents at the Student Affairs office.",
      coverImageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80",
      isPinned: true,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
    },
    {
      titleTh: "ขอเชิญร่วมงานสัมมนาวิชาการระดับชาติ AI & Cloud Transformation Summit 2026",
      titleEn: "Invitation: National Conference on AI & Cloud Transformation 2026",
      slug: "ai-cloud-summit-2026",
      category: "ACTIVITY" as const,
      contentTh: "ขอเชิญคณาจารย์ นักวิจัย และนักศึกษาเข้าร่วมฟังการบรรยายพิเศษจากผู้เชี่ยวชาญระดับโลกในหัวข้อ AI & Cloud Enterprise Transformation ณ หอประชุมใหญ่ คณะเทคโนโลยีและการจัดการ ในวันที่ 25 ตุลาคม 2569 ลงทะเบียนฟรีไม่มีค่าใช้จ่าย",
      contentEn: "We cordially invite researchers, faculty members, and students to attend the keynote conference on AI & Cloud Enterprise Transformation at the Faculty Auditorium on October 25, 2026. Free registration.",
      coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
      isPinned: false,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
    },
    {
      titleTh: "ประกาศประกวดราคาซื้อครุภัณฑ์เครื่องคอมพิวเตอร์ประมวลผลสูงสำหรับห้องปฏิบัติการ AI",
      titleEn: "Procurement Notice: High-Performance Computing Hardware for AI Lab",
      slug: "procurement-ai-hpc-lab-2026",
      category: "PROCUREMENT" as const,
      contentTh: "คณะเทคโนโลยีและการจัดการ มีความประสงค์จะประกวดราคาซื้อครุภัณฑ์เครื่องคอมพิวเตอร์ประมวลผลสูงสำหรับห้องปฏิบัติการปัญญาประดิษฐ์ ด้วยวิธีประกวดราคาอิเล็กทรอนิกส์ (e-bidding) ราคากลาง 4,500,000 บาท กำหนดยื่นข้อเสนอและเสนอราคาทางระบบ e-GP",
      contentEn: "Faculty of Technology and Management invites bids for high-performance computing hardware for AI Laboratory via electronic bidding (e-bidding) with reference budget 4,500,000 THB. Submit proposals via e-GP system.",
      coverImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
      isPinned: false,
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
    },
  ];

  for (const n of sampleNews) {
    await prisma.newsArticle.upsert({
      where: { tenantId_slug: { tenantId: core.tenantId, slug: n.slug } },
      update: {},
      create: { tenantId: core.tenantId, ...n },
    });
  }

  // Seed sample personnel
  const samplePersonnel = [
    {
      prefixTh: "ศ. ดร.",
      prefixEn: "Prof. Dr.",
      firstNameTh: "สมชาย",
      lastNameTh: "มั่นคง",
      firstNameEn: "Somchai",
      lastNameEn: "Mankong",
      academicRank: "PROFESSOR" as const,
      adminPosition: "DEAN" as const,
      personnelType: "ACADEMIC" as const,
      deptCode: "CS",
      email: "somchai.m@faculty.ac.th",
      phone: "02-123-4567 ext 101",
      roomNumber: "CB-401",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      educationHistory: [
        { degree: "Ph.D. in Computer Science", field: "Computer Systems", institution: "MIT, USA", year: 2010 },
        { degree: "M.S. in Computer Engineering", field: "Computer Engineering", institution: "Chulalongkorn University", year: 2005 },
        { degree: "B.Eng. in Computer Engineering (Honours)", field: "Computer Engineering", institution: "Chulalongkorn University", year: 2002 },
      ],
      expertise: ["Artificial Intelligence", "High-Performance Computing", "Distributed Systems"],
      researchInterests: "การพัฒนาระบบปัญญาประดิษฐ์แบบกระจายศูนย์สำหรับการวิเคราะห์ข้อมูลขนาดใหญ่ในระดับองค์กร และนวัตกรรมการประมวลผลบนคลาวด์",
      orderIndex: 1,
      isActive: true,
    },
    {
      prefixTh: "รศ. ดร.",
      prefixEn: "Assoc. Prof. Dr.",
      firstNameTh: "อารียา",
      lastNameTh: "รัตนโชติ",
      firstNameEn: "Areeya",
      lastNameEn: "Rattanachote",
      academicRank: "ASSOC_PROF" as const,
      adminPosition: "VICE_DEAN" as const,
      personnelType: "ACADEMIC" as const,
      deptCode: "IT",
      email: "areeya.r@faculty.ac.th",
      phone: "02-123-4567 ext 102",
      roomNumber: "CB-402",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      educationHistory: [
        { degree: "Ph.D. in Information Systems", field: "Information Security", institution: "University of Melbourne, Australia", year: 2014 },
        { degree: "M.Sc. in Data Science", field: "Data Science", institution: "Imperial College London, UK", year: 2009 },
        { degree: "B.Sc. in Information Technology", field: "IT", institution: "Mahidol University", year: 2006 },
      ],
      expertise: ["Cybersecurity", "Cloud Architecture", "Data Governance"],
      researchInterests: "ความมั่นคงปลอดภัยไซเบอร์ในยุคปัญญาประดิษฐ์และการจัดการความเสี่ยงด้านข้อมูลส่วนบุคคล (PDPA/GDPR)",
      orderIndex: 2,
      isActive: true,
    },
    {
      prefixTh: "ผศ. ดร.",
      prefixEn: "Asst. Prof. Dr.",
      firstNameTh: "ธนากร",
      lastNameTh: "วิทยากร",
      firstNameEn: "Thanakorn",
      lastNameEn: "Wittayakorn",
      academicRank: "ASST_PROF" as const,
      adminPosition: "HEAD_OF_DEPT" as const,
      personnelType: "ACADEMIC" as const,
      deptCode: "CS",
      email: "thanakorn.w@faculty.ac.th",
      phone: "02-123-4567 ext 201",
      roomNumber: "CS-301",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      educationHistory: [
        { degree: "Ph.D. in Computer Science", field: "Artificial Intelligence", institution: "Tokyo Institute of Technology, Japan", year: 2018 },
        { degree: "B.Sc. in Computer Science", field: "Computer Science", institution: "Kasetsart University", year: 2012 },
      ],
      expertise: ["Natural Language Processing", "Large Language Models", "Thai NLP"],
      researchInterests: "การประมวลผลภาษาธรรมชาติภาษาไทยและการประยุกต์ใช้ Large Language Models ในการศึกษาและการแพทย์",
      orderIndex: 3,
      isActive: true,
    },
    {
      prefixTh: "ผศ. ดร.",
      prefixEn: "Asst. Prof. Dr.",
      firstNameTh: "นภัสวรรณ",
      lastNameTh: "ศิริวัฒน์",
      firstNameEn: "Napaswan",
      lastNameEn: "Siriwat",
      academicRank: "ASST_PROF" as const,
      adminPosition: "HEAD_OF_DEPT" as const,
      personnelType: "ACADEMIC" as const,
      deptCode: "IT",
      email: "napaswan.s@faculty.ac.th",
      phone: "02-123-4567 ext 301",
      roomNumber: "IT-201",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      educationHistory: [
        { degree: "Ph.D. in Enterprise Software Engineering", field: "Software Architecture", institution: "Carnegie Mellon University, USA", year: 2017 },
        { degree: "B.Eng. in Information Engineering", field: "Information Engineering", institution: "KMITL", year: 2011 },
      ],
      expertise: ["Microservices Architecture", "DevOps & SRE", "Cloud-Native Platforms"],
      researchInterests: "สถาปัตยกรรมไมโครเซอร์วิสแบบ Cloud-Native และการทำ Automated CI/CD สำหรับระบบงานขนาดใหญ่",
      orderIndex: 4,
      isActive: true,
    },
    {
      prefixTh: "อ.",
      prefixEn: "Mr.",
      firstNameTh: "กานต์",
      lastNameTh: "ประเสริฐสุข",
      firstNameEn: "Karn",
      lastNameEn: "Prasertsuk",
      academicRank: "LECTURER" as const,
      adminPosition: "NONE" as const,
      personnelType: "ACADEMIC" as const,
      deptCode: "IM",
      email: "karn.p@faculty.ac.th",
      phone: "02-123-4567 ext 402",
      roomNumber: "IM-102",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      educationHistory: [
        { degree: "M.S. in Innovation & Entrepreneurship", field: "Innovation Management", institution: "Stanford University, USA", year: 2021 },
        { degree: "B.B.A. in Business Administration", field: "Marketing & Tech", institution: "Thammasat University", year: 2017 },
      ],
      expertise: ["Tech Entrepreneurship", "Product Management", "Design Thinking"],
      researchInterests: "นวัตกรรมดิจิทัลสำหรับธุรกิจสตาร์ทอัพและการประยุกต์ใช้ Design Thinking ในการพัฒนาโมเดลธุรกิจยุคใหม่",
      orderIndex: 5,
      isActive: true,
    },
    {
      prefixTh: "นาง",
      prefixEn: "Mrs.",
      firstNameTh: "วรรณภา",
      lastNameTh: "สดใส",
      firstNameEn: "Wannapha",
      lastNameEn: "Sodsai",
      academicRank: "NONE" as const,
      adminPosition: "SECRETARY" as const,
      personnelType: "SUPPORT" as const,
      deptCode: "CS",
      email: "wannapha.s@faculty.ac.th",
      phone: "02-123-4567 ext 110",
      roomNumber: "ADM-101",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      educationHistory: [
        { degree: "M.Ed. in Educational Administration", field: "Educational Administration", institution: "Chulalongkorn University", year: 2015 },
        { degree: "B.A. in English", field: "English Language", institution: "Thammasat University", year: 2008 },
      ],
      expertise: ["Academic Services", "Student Affairs", "University Administration"],
      researchInterests: null,
      orderIndex: 6,
      isActive: true,
    },
  ];

  for (const p of samplePersonnel) {
    const { deptCode, ...profileData } = p;
    const departmentId = deptMap[deptCode] ?? null;
    const existing = await prisma.staffProfile.findFirst({
      where: { tenantId: core.tenantId, email: p.email },
    });
    if (existing) {
      await prisma.staffProfile.update({
        where: { id: existing.id },
        data: { ...profileData, departmentId },
      });
    } else {
      await prisma.staffProfile.create({
        data: { tenantId: core.tenantId, departmentId, ...profileData },
      });
    }
  }

  // Seed sample curriculum programs
  const samplePrograms = [
    {
      code: "CS-BS-2565",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Bachelor of Science in Computer Science",
      degreeTitleTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
      degreeTitleEn: "Bachelor of Science (Computer Science)",
      degreeAbbrTh: "วท.บ. (วิทยาการคอมพิวเตอร์)",
      degreeAbbrEn: "B.Sc. (Computer Science)",
      degreeLevel: "BACHELOR" as const,
      programPlan: "REGULAR" as const,
      deptCode: "CS",
      durationYears: 4,
      totalCredits: 128,
      tuitionFeeSemester: 25000,
      descriptionTh: "มุ่งเน้นผลิตบัณฑิตที่มีความรู้ความเชี่ยวชาญด้านวิทยาการคอมพิวเตอร์ การพัฒนาซอฟต์แวร์สมัยใหม่ ปัญญาประดิษฐ์ (AI) และระบบคลาวด์ มีทักษะการคิดวิเคราะห์เชิงระบบและการแก้ปัญหาที่ซับซ้อนตามมาตรฐานสากล",
      descriptionEn: "Aimed at producing graduates with world-class expertise in computer science, modern software engineering, artificial intelligence (AI), and cloud platforms with rigorous computational thinking and problem-solving skills.",
      careerPaths: ["Software Engineer", "Fullstack Developer", "AI Engineer", "Data Scientist", "DevOps Engineer"],
      curriculumStructure: [
        { category: "หมวดวิชาศึกษาทั่วไป (General Education)", credits: 30, description: "ภาษา การสื่อสาร สังคมศาสตร์ และมนุษยศาสตร์" },
        { category: "หมวดวิชาเฉพาะ (Specialized Courses)", credits: 92, description: "วิชาแกน 24 นก., วิชาเฉพาะด้านบังคับ 48 นก., วิชาเลือก 20 นก." },
        { category: "หมวดวิชาเลือกเสรี (Free Electives)", credits: 6, description: "เลือกเรียนวิชาใดก็ได้ในมหาวิทยาลัย" },
      ],
      coverImageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      status: "ACTIVE" as const,
      orderIndex: 1,
    },
    {
      code: "IT-BS-2565",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล",
      nameEn: "Bachelor of Science in Information Technology and Digital Innovation",
      degreeTitleTh: "วิทยาศาสตรบัณฑิต (เทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล)",
      degreeTitleEn: "Bachelor of Science (Information Technology and Digital Innovation)",
      degreeAbbrTh: "วท.บ. (เทคโนโลยีสารสนเทศและนวัตกรรมดิจิทัล)",
      degreeAbbrEn: "B.Sc. (Information Technology and Digital Innovation)",
      degreeLevel: "BACHELOR" as const,
      programPlan: "REGULAR" as const,
      deptCode: "IT",
      durationYears: 4,
      totalCredits: 130,
      tuitionFeeSemester: 24000,
      descriptionTh: "เน้นการประยุกต์ใช้เทคโนโลยีดิจิทัล โครงสร้างพื้นฐานคลาวด์ ความมั่นคงปลอดภัยทางไซเบอร์ (Cybersecurity) และการบริหารจัดการนวัตกรรมเพื่อขับเคลื่อนองค์กรยุคใหม่",
      descriptionEn: "Focused on applied digital technologies, cloud infrastructure, enterprise cybersecurity, and innovation management driving next-generation enterprise transformation.",
      careerPaths: ["Cloud Solutions Architect", "DevOps Engineer", "Cybersecurity Specialist", "IT Consultant", "Systems Administrator"],
      curriculumStructure: [
        { category: "หมวดวิชาศึกษาทั่วไป (General Education)", credits: 30, description: "ทักษะศตวรรษที่ 21 ภาษา และภาวะผู้นำ" },
        { category: "หมวดวิชาเฉพาะ (Specialized Courses)", credits: 94, description: "วิชาพื้นฐานระบบไอที เครือข่าย และคลาวด์" },
        { category: "หมวดวิชาเลือกเสรี (Free Electives)", credits: 6, description: "เลือกเรียนวิชาเสริมทักษะอาชีพ" },
      ],
      coverImageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
      status: "ACTIVE" as const,
      orderIndex: 2,
    },
    {
      code: "CS-MS-2566",
      nameTh: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการข้อมูลและปัญญาประดิษฐ์ประยุกต์",
      nameEn: "Master of Science in Applied Data Science and Artificial Intelligence",
      degreeTitleTh: "วิทยาศาสตรมหาบัณฑิต (วิทยาการข้อมูลและปัญญาประดิษฐ์ประยุกต์)",
      degreeTitleEn: "Master of Science (Applied Data Science and Artificial Intelligence)",
      degreeAbbrTh: "วท.ม. (วิทยาการข้อมูลและปัญญาประดิษฐ์ประยุกต์)",
      degreeAbbrEn: "M.Sc. (Applied Data Science and Artificial Intelligence)",
      degreeLevel: "MASTER" as const,
      programPlan: "SPECIAL" as const,
      deptCode: "CS",
      durationYears: 2,
      totalCredits: 36,
      tuitionFeeSemester: 45000,
      descriptionTh: "หลักสูตรระดับบัณฑิตศึกษาที่เจาะลึกด้าน Machine Learning ขั้นสูง, Deep Learning, Big Data Engineering, และการวิจัยสร้างโมเดลปัญญาประดิษฐ์ที่ตอบโจทย์ภาคธุรกิจและอุตสาหกรรมสุขภาพ",
      descriptionEn: "Advanced graduate program specializing in cutting-edge Machine Learning, Deep Learning, Big Data Engineering, and industry-tailored AI models for enterprise and healthcare.",
      careerPaths: ["Lead Data Scientist", "Senior AI Researcher", "Machine Learning Engineer", "University Lecturer", "Chief Data Officer"],
      curriculumStructure: [
        { category: "วิชาบังคับ (Core Courses)", credits: 12, description: "Advanced Machine Learning, Big Data Analytics" },
        { category: "วิชาเลือก (Electives)", credits: 12, description: "NLP, Computer Vision, Generative AI" },
        { category: "วิทยานิพนธ์ / การค้นคว้าอิสระ (Thesis)", credits: 12, description: "วิทยานิพนธ์วิจัยหรือการค้นคว้าอิสระ" },
      ],
      coverImageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=80",
      status: "ACTIVE" as const,
      orderIndex: 3,
    },
    {
      code: "IM-PHD-2567",
      nameTh: "หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาการจัดการเทคโนโลยีและนวัตกรรมดิจิทัล",
      nameEn: "Doctor of Philosophy in Digital Technology and Innovation Management",
      degreeTitleTh: "ปรัชญาดุษฎีบัณฑิต (การจัดการเทคโนโลยีและนวัตกรรมดิจิทัล)",
      degreeTitleEn: "Doctor of Philosophy (Digital Technology and Innovation Management)",
      degreeAbbrTh: "ปร.ด. (การจัดการเทคโนโลยีและนวัตกรรมดิจิทัล)",
      degreeAbbrEn: "Ph.D. (Digital Technology and Innovation Management)",
      degreeLevel: "DOCTORATE" as const,
      programPlan: "REGULAR" as const,
      deptCode: "IM",
      durationYears: 3,
      totalCredits: 48,
      tuitionFeeSemester: 65000,
      descriptionTh: "หลักสูตรปริญญาเอกมุ่งเน้นการวิจัยระดับแนวหน้า เพื่อสร้างองค์ความรู้ใหม่ด้านการบริหารจัดการนวัตกรรมดิจิทัล กลยุทธ์การเปลี่ยนผ่านองค์กร และการสร้างมูลค่าทางเศรษฐกิจและสังคมด้วยเทคโนโลยีขั้นสูง",
      descriptionEn: "Top-tier doctoral program focused on breakthrough research in digital innovation management, organizational transformation strategies, and high-impact technology commercialization.",
      careerPaths: ["Chief Technology Officer (CTO)", "Director of Digital Transformation", "Senior Innovation Consultant", "Academic Professor", "Senior Policy Researcher"],
      curriculumStructure: [
        { category: "วิชาสัมมนาและวิธีวิทยาการวิจัย (Research Methodology)", credits: 12, description: "Advanced Qualitative & Quantitative Research" },
        { category: "ดุษฎีนิพนธ์ (Doctoral Dissertation)", credits: 36, description: "งานวิจัยดุษฎีนิพนธ์ตีพิมพ์ในวารสารระดับนานาชาติ" },
      ],
      coverImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
      status: "ACTIVE" as const,
      orderIndex: 4,
    },
  ];

  for (const prog of samplePrograms) {
    const { deptCode, ...progData } = prog;
    const departmentId = deptMap[deptCode] ?? null;
    await prisma.curriculumProgram.upsert({
      where: { tenantId_code: { tenantId: core.tenantId, code: prog.code } },
      update: { ...progData, departmentId },
      create: { tenantId: core.tenantId, departmentId, ...progData },
    });
  }

  // Seed sample e-documents & approvals
  const adminUser = await prisma.user.findFirst({ where: { email: "admin@app.local" } });
  const staffUser = await prisma.user.findFirst({ where: { email: "staff@app.local" } });

  if (adminUser && staffUser) {
    const sampleDocs = [
      {
        documentNumber: "DOC-2026-0001",
        title: "ขออนุมัติจัดโครงการสัมมนาเชิงปฏิบัติการ AI & Enterprise Cloud Summit 2026",
        documentType: "PROJECT_PROPOSAL" as const,
        urgency: "URGENT" as const,
        departmentId: deptMap["CS"],
        content: "เนื่องด้วยภาควิชาวิทยาการคอมพิวเตอร์มีความประสงค์จะจัดโครงการสัมมนาเชิงปฏิบัติการเพื่อเสริมสร้างทักษะความรู้ด้าน Generative AI และ Cloud Architecture แก่นักศึกษาและอาจารย์ จึงขออนุมัติงบประมาณและสถานที่จัดงาน",
        amount: 85000,
        submitterId: staffUser.id,
        status: "UNDER_REVIEW" as const,
        currentStep: 2,
        totalSteps: 3,
        approvals: [
          {
            stepOrder: 1,
            stepNameTh: "หัวหน้าภาควิชา / สังกัด",
            stepNameEn: "Department Head",
            status: "APPROVED" as const,
            comment: "เห็นควรสนับสนุน โครงการตรงตามแผนยุทธศาสตร์คณะ",
            approverRole: "HEAD_OF_DEPT",
            decidedAt: new Date(),
            decidedByUserId: adminUser.id,
          },
          {
            stepOrder: 2,
            stepNameTh: "รองคณบดีฝ่ายวิชาการและวิจัย",
            stepNameEn: "Vice Dean (Academic & Research)",
            status: "PENDING" as const,
            comment: null,
            approverRole: "VICE_DEAN",
          },
          {
            stepOrder: 3,
            stepNameTh: "คณบดีคณะเทคโนโลยีและการจัดการ",
            stepNameEn: "Dean",
            status: "PENDING" as const,
            comment: null,
            approverRole: "DEAN",
          },
        ],
        attachments: [
          {
            fileName: "Project_Proposal_AI_Summit_2026.pdf",
            fileUrl: "https://example.com/docs/ai_summit_proposal.pdf",
          },
        ],
        comments: [
          {
            userId: staffUser.id,
            message: "แนบกำหนดการและประมาณการค่าใช้จ่ายฉบับปรับปรุงแล้วครับ",
          },
        ],
      },
      {
        documentNumber: "DOC-2026-0002",
        title: "ขออนุมัติเดินทางไปราชการเพื่อนำเสนอผลงานวิจัยระดับนานาชาติ IEEE ณ ประเทศญี่ปุ่น",
        documentType: "OFFICIAL_TRAVEL" as const,
        urgency: "NORMAL" as const,
        departmentId: deptMap["IT"],
        content: "ข้าพเจ้าได้รับการตอบรับให้นำเสนอผลงานวิจัยเรื่อง Cloud Security in Modern Healthcare ในการประชุมวิชาการระดับนานาชาติ IEEE CloudCom 2026 ณ เมืองโตเกียว ประเทศญี่ปุ่น จึงใคร่ขออนุมัติเดินทางไปราชการและเบิกจ่ายค่าลงทะเบียน",
        amount: 62000,
        submitterId: staffUser.id,
        status: "APPROVED" as const,
        currentStep: 3,
        totalSteps: 3,
        approvals: [
          {
            stepOrder: 1,
            stepNameTh: "หัวหน้าภาควิชา / สังกัด",
            stepNameEn: "Department Head",
            status: "APPROVED" as const,
            comment: "ผลงานระดับ Q1 สมควรสนับสนุน",
            approverRole: "HEAD_OF_DEPT",
            decidedAt: new Date(),
            decidedByUserId: adminUser.id,
          },
          {
            stepOrder: 2,
            stepNameTh: "รองคณบดีฝ่ายบริหาร",
            stepNameEn: "Vice Dean (Administration)",
            status: "APPROVED" as const,
            comment: "อนุมัติเบิกจ่ายตามสิทธิเงินรายได้คณะ",
            approverRole: "VICE_DEAN",
            decidedAt: new Date(),
            decidedByUserId: adminUser.id,
          },
          {
            stepOrder: 3,
            stepNameTh: "คณบดีคณะเทคโนโลยีและการจัดการ",
            stepNameEn: "Dean",
            status: "APPROVED" as const,
            comment: "อนุมัติให้เดินทางไปราชการ ขอให้เดินทางโดยสวัสดิภาพ",
            approverRole: "DEAN",
            decidedAt: new Date(),
            decidedByUserId: adminUser.id,
          },
        ],
        attachments: [
          {
            fileName: "IEEE_Acceptance_Letter.pdf",
            fileUrl: "https://example.com/docs/ieee_acceptance.pdf",
          },
        ],
        comments: [
          {
            userId: staffUser.id,
            message: "แนบหนังสือตอบรับและตารางการประชุมเรียบร้อยแล้วครับ",
          },
        ],
      },
      {
        documentNumber: "DOC-2026-0003",
        title: "ขอจัดซื้อเครื่องคอมพิวเตอร์แม่ข่ายสำหรับห้องปฏิบัติการ High-Performance Computing (HPC)",
        documentType: "PROCUREMENT_REQ" as const,
        urgency: "VERY_URGENT" as const,
        departmentId: deptMap["CS"],
        content: "เพื่อรองรับการประมวลผลโมเดล AI ขนาดใหญ่สำหรับงานวิจัยและวิทยานิพนธ์นักศึกษา จำเป็นต้องจัดซื้อเครื่องเซิร์ฟเวอร์ GPU จำนวน 2 เครื่องทดแทนเครื่องเดิมที่ชำรุด",
        amount: 450000,
        submitterId: staffUser.id,
        status: "SUBMITTED" as const,
        currentStep: 1,
        totalSteps: 3,
        approvals: [
          {
            stepOrder: 1,
            stepNameTh: "หัวหน้าภาควิชา / สังกัด",
            stepNameEn: "Department Head",
            status: "PENDING" as const,
            comment: null,
            approverRole: "HEAD_OF_DEPT",
          },
          {
            stepOrder: 2,
            stepNameTh: "หัวหน้างานพัสดุและคลัง",
            stepNameEn: "Head of Procurement",
            status: "PENDING" as const,
            comment: null,
            approverRole: "SECRETARY",
          },
          {
            stepOrder: 3,
            stepNameTh: "คณบดีคณะเทคโนโลยีและการจัดการ",
            stepNameEn: "Dean",
            status: "PENDING" as const,
            comment: null,
            approverRole: "DEAN",
          },
        ],
        attachments: [
          {
            fileName: "TOR_HPC_Server_Specification.pdf",
            fileUrl: "https://example.com/docs/tor_hpc_server.pdf",
          },
        ],
        comments: [],
      },
      {
        documentNumber: "DOC-2026-0004",
        title: "ขออนุมัติจัดกิจกรรมค่ายนวัตกรรมดิจิทัลสำหรับเยาวชน (Young Digital Innovators Camp 2026)",
        documentType: "PROJECT_PROPOSAL" as const,
        urgency: "NORMAL" as const,
        departmentId: deptMap["IM"],
        content: "โครงการจัดค่ายฝึกอบรมเชิงปฏิบัติการด้าน Design Thinking และ Business Model สำหรับนักเรียนมัธยมปลายในเขตภาคกลาง เพื่อประชาสัมพันธ์หลักสูตรของคณะ",
        amount: 40000,
        submitterId: staffUser.id,
        status: "REVISED_REQUESTED" as const,
        currentStep: 1,
        totalSteps: 3,
        approvals: [
          {
            stepOrder: 1,
            stepNameTh: "หัวหน้าภาควิชา / สังกัด",
            stepNameEn: "Department Head",
            status: "REVISED_REQUESTED" as const,
            comment: "ขอให้ปรับลดงบประมาณค่าอาหารว่างลง 20% และแนบรายชื่อวิทยากรภายนอกเพิ่มเติม",
            approverRole: "HEAD_OF_DEPT",
            decidedAt: new Date(),
            decidedByUserId: adminUser.id,
          },
          {
            stepOrder: 2,
            stepNameTh: "รองคณบดีฝ่ายวิชาการและวิจัย",
            stepNameEn: "Vice Dean (Academic & Research)",
            status: "PENDING" as const,
            comment: null,
            approverRole: "VICE_DEAN",
          },
          {
            stepOrder: 3,
            stepNameTh: "คณบดีคณะเทคโนโลยีและการจัดการ",
            stepNameEn: "Dean",
            status: "PENDING" as const,
            comment: null,
            approverRole: "DEAN",
          },
        ],
        attachments: [],
        comments: [
          {
            userId: adminUser.id,
            message: "ให้ผู้เสนอโครงการแก้ไขงบประมาณและส่งกลับมาพิจารณาอีกครั้งครับ",
          },
        ],
      },
    ];

    for (const d of sampleDocs) {
      const { approvals, attachments, comments, ...docData } = d;
      const existing = await prisma.eDocument.findFirst({
        where: { tenantId: core.tenantId, documentNumber: d.documentNumber },
      });

      if (!existing) {
        await prisma.eDocument.create({
          data: {
            tenantId: core.tenantId,
            ...docData,
            approvals: { create: approvals },
            attachments: { create: attachments },
            comments: { create: comments },
          },
        });
      }
    }

    // -------------------------------------------------------------------------
    // Phase 5: Resources & Reservations (ห้องประชุมและยานพาหนะ)
    // -------------------------------------------------------------------------
    const sampleResources = [
      {
        type: "ROOM" as const,
        code: "RM-201",
        nameTh: "ห้องประชุมทองกวาว",
        nameEn: "Thongkwaw Conference Room",
        description: "ห้องประชุมขนาดกลาง ติดตั้งระบบจอสัมผัสอัจฉริยะและระบบประชุมทางไกล เหมาะสำหรับการประชุมภาควิชาและคณะทำงาน",
        capacity: 25,
        location: "อาคาร 2 ชั้น 2",
        amenities: ["Projector 4K", "Smart TV 75\"", "Wireless Microphone", "Video Conference (Zoom/Teams)"],
        isActive: true,
      },
      {
        type: "ROOM" as const,
        code: "RM-305",
        nameTh: "ห้องสัมมนานวัตกรรมดิจิทัล",
        nameEn: "Digital Innovation Seminar Room",
        description: "ห้องสัมมนาแบบ Amphitheater รองรับการบรรยายพิเศษ การนำเสนอผลงานวิจัย และสัมมนาวิชาการระดับชาติ",
        capacity: 60,
        location: "อาคารนวัตกรรม ชั้น 3",
        amenities: ["Laser Projector", "Surround Sound", "Hybrid Meeting System", "Live Streaming Kit", "Podium Microphone"],
        isActive: true,
      },
      {
        type: "ROOM" as const,
        code: "RM-BOARD",
        nameTh: "ห้องประชุมคณะกรรมการประจำคณะ",
        nameEn: "Executive Boardroom",
        description: "ห้องประชุมผู้บริหารและคณะกรรมการประจำคณะ ออกแบบสไตล์ Executive พร้อมระบบไมโครโฟนรายบุคคล",
        capacity: 16,
        location: "อาคารอำนวยการ ชั้น 4",
        amenities: ["Individual Microphones", "Dual 85\" 4K Displays", "Cisco Webex Room Kit", "Coffee & Snack Bar"],
        isActive: true,
      },
      {
        type: "VEHICLE" as const,
        code: "VAN-01",
        nameTh: "รถตู้โดยสาร Toyota Commuter (VIP 10 ที่นั่ง)",
        nameEn: "Toyota Commuter VIP Van (10 Seats)",
        description: "รถตู้ปรับอากาศ VIP เบาะนวดไฟฟ้า สำหรับการเดินทางไปราชการ ดูงาน และนำนักศึกษาเข้าร่วมแข่งขันทางวิชาการ",
        capacity: 10,
        licensePlate: "นข-4455 เชียงใหม่",
        driverName: "นายสมศักดิ์ ขับปลอดภัย",
        driverPhone: "081-234-5678",
        amenities: ["WiFi Onboard", "USB Quick Charge 3.0", "First Aid Kit", "Dashcam"],
        isActive: true,
      },
      {
        type: "VEHICLE" as const,
        code: "SEDAN-02",
        nameTh: "รถเก๋งประจำคณะ Toyota Camry Hybrid",
        nameEn: "Faculty Sedan Toyota Camry Hybrid",
        description: "รถยนต์ส่วนกลางสำหรับผู้บริหารและอาจารย์เดินทางติดต่อประสานงานราชการภายนอก",
        capacity: 4,
        licensePlate: "กข-1234 เชียงใหม่",
        driverName: "นายมานพ สุจริต",
        driverPhone: "089-876-5432",
        amenities: ["GPS Tracking", "Dashcam", "Child Safety Seat Available"],
        isActive: true,
      },
    ];

    const resourceMap: Record<string, string> = {};

    for (const r of sampleResources) {
      let item = await prisma.resourceItem.findFirst({
        where: { tenantId: core.tenantId, code: r.code },
      });

      if (!item) {
        item = await prisma.resourceItem.create({
          data: {
            tenantId: core.tenantId,
            ...r,
          },
        });
      }
      resourceMap[r.code] = item.id;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const res1Start = new Date(tomorrow);
    res1Start.setHours(9, 30, 0, 0);
    const res1End = new Date(tomorrow);
    res1End.setHours(12, 0, 0, 0);

    const res2Start = new Date(tomorrow);
    res2Start.setHours(13, 30, 0, 0);
    const res2End = new Date(tomorrow);
    res2End.setHours(16, 30, 0, 0);

    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const res3Start = new Date(threeDaysLater);
    res3Start.setHours(7, 0, 0, 0);
    const res3End = new Date(threeDaysLater);
    res3End.setHours(20, 0, 0, 0);

    const sampleReservations = [
      {
        resourceId: resourceMap["RM-201"],
        userId: adminUser.id,
        departmentId: deptMap["CS"],
        title: "การประชุมคณะกรรมการบริหารหลักสูตร วท.บ. สาขาวิชาวิทยาการคอมพิวเตอร์",
        purpose: "พิจารณาการปรับปรุงแผนการศึกษาและรายวิชาเลือกเสรี ประจำภาคเรียนที่ 1/2569",
        attendeesCount: 12,
        startTime: res1Start,
        endTime: res1End,
        status: "APPROVED" as const,
        reviewNotes: "อนุมัติการใช้งานห้องประชุม พร้อมจัดเตรียมเจ้าหน้าที่เทคนิคประจำห้อง",
        reviewedByUserId: adminUser.id,
        reviewedAt: new Date(),
      },
      {
        resourceId: resourceMap["RM-305"],
        userId: staffUser.id,
        departmentId: deptMap["IT"],
        title: "สัมมนาเตรียมความพร้อมสหกิจศึกษาและโครงงานวิจัย",
        purpose: "บรรยายพิเศษให้กับนักศึกษาชั้นปีที่ 3 และ 4 เกี่ยวกับระเบียบการฝึกปฏิบัติงานและการเขียนโครงงาน",
        attendeesCount: 45,
        startTime: res2Start,
        endTime: res2End,
        status: "PENDING" as const,
      },
      {
        resourceId: resourceMap["VAN-01"],
        userId: staffUser.id,
        departmentId: deptMap["CS"],
        title: "เดินทางนำนักศึกษาเข้าร่วมการแข่งขัน Thailand ICT Awards (TICTA)",
        purpose: "นำทีมนักศึกษาตัวแทนคณะเข้าร่วมประกวดผลงานซอฟต์แวร์ระดับประเทศ ณ ไบเทค บางนา",
        attendeesCount: 8,
        destination: "ศูนย์นิทรรศการและการประชุมไบเทค บางนา กรุงเทพฯ",
        startTime: res3Start,
        endTime: res3End,
        status: "APPROVED" as const,
        reviewNotes: "อนุมัติการเดินทางและมอบหมายนายสมศักดิ์ เป็นพนักงานขับรถ",
        reviewedByUserId: adminUser.id,
        reviewedAt: new Date(),
      },
      {
        resourceId: resourceMap["SEDAN-02"],
        userId: staffUser.id,
        departmentId: deptMap["IM"],
        title: "เดินทางไปร่วมพิธีลงนามบันทึกข้อตกลงความร่วมมือทางวิชาการ (MOU)",
        purpose: "พิธีลงนามความร่วมมือระหว่างคณะฯ กับกรมพัฒนาธุรกิจการค้า",
        attendeesCount: 3,
        destination: "กระทรวงพาณิชย์ ถนนนนทบุรี 1 นนทบุรี",
        startTime: new Date(Date.now() + 86400000 * 5),
        endTime: new Date(Date.now() + 86400000 * 5 + 3600000 * 6),
        status: "PENDING" as const,
      },
    ];

    for (const resv of sampleReservations) {
      const existing = await prisma.resourceReservation.findFirst({
        where: {
          tenantId: core.tenantId,
          resourceId: resv.resourceId,
          title: resv.title,
        },
      });

      if (!existing) {
        await prisma.resourceReservation.create({
          data: {
            tenantId: core.tenantId,
            ...resv,
          },
        });
      }
    }
  }

  console.log(`[seed] เสร็จ — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
