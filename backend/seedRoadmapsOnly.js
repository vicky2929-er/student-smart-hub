require('dotenv').config();
const mongoose = require('mongoose');
const Roadmap = require('./model/roadmap');
const Student = require('./model/student');

const careerPathData = {
  'Full Stack Developer': {
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML/CSS', 'Git'],
    roadmap: [
      'Master HTML, CSS, and JavaScript fundamentals',
      'Learn React.js for frontend development',
      'Study Node.js and Express for backend',
      'Learn database design with MongoDB/PostgreSQL',
      'Build REST APIs and implement authentication',
      'Deploy full-stack projects on cloud platforms',
      'Create a portfolio with 3-5 full-stack projects',
      'Contribute to open-source projects on GitHub',
      'Apply for junior full-stack developer positions'
    ]
  },
  'Data Scientist': {
    skills: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Statistics', 'SQL'],
    roadmap: [
      'Master Python programming and data structures',
      'Learn statistics and probability theory',
      'Study Pandas and NumPy for data manipulation',
      'Learn data visualization with Matplotlib/Seaborn',
      'Master SQL for database querying',
      'Learn machine learning algorithms with Scikit-learn',
      'Work on real-world datasets from Kaggle',
      'Build end-to-end data science projects',
      'Create a data science portfolio and blog'
    ]
  },
  'Machine Learning Engineer': {
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'MLOps', 'Docker'],
    roadmap: [
      'Master Python and linear algebra fundamentals',
      'Learn supervised and unsupervised ML algorithms',
      'Study deep learning with TensorFlow/PyTorch',
      'Learn neural network architectures (CNN, RNN, Transformers)',
      'Practice on ML competitions (Kaggle, DrivenData)',
      'Learn MLOps: model deployment and monitoring',
      'Study cloud ML services (AWS SageMaker, GCP AI)',
      'Build and deploy ML models in production',
      'Contribute to open-source ML projects'
    ]
  },
  'DevOps Engineer': {
    skills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
    roadmap: [
      'Master Linux system administration and shell scripting',
      'Learn Git version control and GitHub workflows',
      'Study Docker containerization and Docker Compose',
      'Learn Kubernetes for container orchestration',
      'Set up CI/CD pipelines with Jenkins/GitHub Actions',
      'Learn Infrastructure as Code with Terraform',
      'Study cloud platforms (AWS/Azure/GCP)',
      'Implement monitoring with Prometheus and Grafana',
      'Get certified (AWS Solutions Architect, CKA)'
    ]
  },
  'Mobile App Developer': {
    skills: ['React Native', 'Flutter', 'JavaScript', 'Dart', 'Firebase', 'APIs'],
    roadmap: [
      'Learn JavaScript/TypeScript fundamentals',
      'Master React Native or Flutter framework',
      'Study mobile UI/UX design principles',
      'Learn state management (Redux, Provider)',
      'Integrate REST APIs and handle async operations',
      'Implement Firebase for backend services',
      'Learn app deployment (App Store, Play Store)',
      'Build 3-5 mobile apps for portfolio',
      'Contribute to open-source mobile projects'
    ]
  },
  'Cloud Architect': {
    skills: ['AWS', 'Azure', 'Networking', 'Security', 'Terraform', 'Architecture'],
    roadmap: [
      'Master cloud computing fundamentals and services',
      'Learn AWS/Azure core services (EC2, S3, Lambda)',
      'Study cloud networking and security best practices',
      'Learn Infrastructure as Code with Terraform/CloudFormation',
      'Design scalable and resilient architectures',
      'Study microservices and serverless architectures',
      'Implement cost optimization strategies',
      'Get cloud certifications (AWS Solutions Architect)',
      'Build multi-cloud architecture projects'
    ]
  },
  'Cybersecurity Specialist': {
    skills: ['Network Security', 'Ethical Hacking', 'Cryptography', 'Linux', 'Python', 'SIEM'],
    roadmap: [
      'Learn networking fundamentals (TCP/IP, OSI model)',
      'Study Linux system administration and security',
      'Master cryptography and encryption techniques',
      'Learn ethical hacking and penetration testing',
      'Study web application security (OWASP Top 10)',
      'Practice on CTF platforms (HackTheBox, TryHackMe)',
      'Learn SIEM tools and security monitoring',
      'Get security certifications (CEH, CISSP, Security+)',
      'Participate in bug bounty programs'
    ]
  },
  'AI Research Scientist': {
    skills: ['Python', 'Research', 'Deep Learning', 'Mathematics', 'PyTorch', 'Publications'],
    roadmap: [
      'Master advanced mathematics (linear algebra, calculus)',
      'Study machine learning theory and algorithms',
      'Learn deep learning architectures in depth',
      'Read and implement research papers from arXiv',
      'Work on novel research problems',
      'Publish papers in conferences (NeurIPS, ICML)',
      'Contribute to AI research communities',
      'Build a strong research portfolio',
      'Apply for research positions or PhD programs'
    ]
  },
  'Backend Engineer': {
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'Docker', 'Kafka'],
    roadmap: [
      'Master Java or Python backend programming',
      'Learn Spring Boot or Django framework',
      'Study database design and SQL optimization',
      'Learn RESTful API design and implementation',
      'Study microservices architecture patterns',
      'Learn message queues (RabbitMQ, Kafka)',
      'Implement caching strategies (Redis, Memcached)',
      'Deploy backend services with Docker/Kubernetes',
      'Build scalable backend systems for portfolio'
    ]
  },
  'Frontend Developer': {
    skills: ['JavaScript', 'React', 'TypeScript', 'CSS', 'Webpack', 'Testing'],
    roadmap: [
      'Master HTML, CSS, and responsive design',
      'Learn JavaScript ES6+ and TypeScript',
      'Master React.js and component-based architecture',
      'Study state management (Redux, Context API)',
      'Learn CSS preprocessors (SASS) and frameworks (Tailwind)',
      'Study build tools (Webpack, Vite) and bundling',
      'Learn testing (Jest, React Testing Library)',
      'Build responsive, accessible web applications',
      'Create a portfolio with modern frontend projects'
    ]
  }
};

async function seedRoadmaps() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.DBURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');

    console.log('🗺️ Creating Career Roadmaps...');
    
    const students = await Student.find({}).limit(100);
    console.log(`Found ${students.length} students`);
    
    const roadmaps = [];
    
    for (let student of students) {
      const numRoadmaps = Math.floor(Math.random() * 3) + 2; // 2-4 roadmaps
      const potentialRoadmaps = [];
      
      // Shuffle career paths
      const careerTitles = Object.keys(careerPathData);
      const shuffledCareers = [...careerTitles].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numRoadmaps; i++) {
        const careerTitle = shuffledCareers[i];
        const careerData = careerPathData[careerTitle];
        const matchScore = parseFloat((Math.random() * 0.4 + 0.6).toFixed(2));
        
        const studentSkills = student.skills?.technical?.length > 0 
          ? student.skills.technical.slice(0, 3)
          : careerData.skills.slice(0, 3);
        
        potentialRoadmaps.push({
          career_title: careerTitle,
          existing_skills: studentSkills,
          match_score: matchScore,
          sequenced_roadmap: careerData.roadmap,
        });
      }

      roadmaps.push({
        student_id: student._id,
        potential_roadmaps: potentialRoadmaps,
        created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        updated_at: new Date(),
      });
    }

    await Roadmap.insertMany(roadmaps);
    console.log(`✅ Created ${roadmaps.length} Career Roadmaps with unique paths`);
    
    // Show sample
    const sample = roadmaps[0];
    console.log('\n📋 Sample Roadmap:');
    sample.potential_roadmaps.forEach((career, i) => {
      console.log(`\n${i+1}. ${career.career_title} (${Math.round(career.match_score * 100)}% match)`);
      console.log(`   Skills: ${career.existing_skills.join(', ')}`);
      console.log(`   Steps (first 3):`);
      career.sequenced_roadmap.slice(0, 3).forEach((step, si) => {
        console.log(`      ${si+1}. ${step}`);
      });
    });

    console.log('\n✅ Roadmap seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding roadmaps:', error);
    process.exit(1);
  }
}

seedRoadmaps();
