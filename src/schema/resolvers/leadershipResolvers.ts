import { Buffer } from 'buffer';
import { writeFile } from 'fs';
import * as PDFDocument from 'pdfkit';
import { getRepository } from 'typeorm';
import { promisify } from 'util';
import {
  ADMIN_NOT_EXISTS,
  COURSE_NOT_FOUND,
  FACULTY_NOT_FOUND,
  NO_ACCESS,
  SOMETHING_WRONG,
  STUDENT_NOT_FOUND
} from '../../config/Errors';
import { Admin } from '../../entity/Admin';
import { Course } from '../../entity/Course';
import { Faculty } from '../../entity/Faculty';
import { LeadershipRecord } from '../../entity/LeadershipRecord';
import { Student } from '../../entity/Student';
import { StudentImage } from '../../entity/StudentImage';
import { StudentTotalMarks } from '../../entity/StudentTotalMarks';

const resolvers = {
  Query: {
    viewRecords,
    viewRecordsCSV: viewRecords,
    calculateStarOfWeek,
    getStudentTotalMarks
  },
  Mutation: { addRecord, deleteRecords }
};

//Query
type viewRecordsArgsType = {
  csv?: boolean;
  date?: string;
  coursename?: string;
  facultyId?: string;
  year?: number;
  section?: string;
};
async function viewRecords(_, args: viewRecordsArgsType) {
  try {
    const recordRepo = await getAllRecords();

    let records = filterRecords(args, recordRepo);

    if (args.csv) {
      return convertToCSV(records);
    }

    return { records };
  } catch (e) {
    return { errors: [{ ...SOMETHING_WRONG, message: `${e}` }] };
  }
}

const getAllRecords = async () => {
  const recordRepo = await getRepository(LeadershipRecord)
    .createQueryBuilder('records')
    .leftJoinAndSelect('records.faculty', 'faculty')
    .leftJoinAndSelect('records.course', 'course')
    .leftJoinAndSelect('records.student', 'student')
    .getMany();
  return recordRepo;
};

const filterRecords = (
  { date, coursename, facultyId, year, section }: viewRecordsArgsType,
  leadershipRecord: LeadershipRecord[],
  isSowNull?:boolean
) => {
  let records = leadershipRecord;

  if (facultyId)
    records = records.filter(record => record.faculty.id === facultyId);

  if (date) records = records.filter(record => record.date === date);

  if (coursename)
    records = records.filter(record => record.course.coursename === coursename);

  if (year) records = records.filter(record => record.student.year === year);

  if (section)
    records = records.filter(record => record.student.section === section);
  
  return records;
};

const convertToCSV = (records: LeadershipRecord[]) => {
  let allRecords: string =
    'Date,CourseCode,CourseName,FacultyName,RegisterNumber,StudentName,Points';

  records.forEach(record => {
    allRecords += `\n${record.date},${record.course.coursecode},${
      record.course.coursename
    },${record.faculty.name},${record.student.registerno},${
      record.student.name
    },${record.points}`;
  });

  return { csv: allRecords };
};

/* ----------------------CALCULATE_STAR_OF_THE_WEEK------------------------- */
type calculateStarOfWeekArgTypes = {
  startDate: string;
  endDate: string;
  year: number;
  section: string;
};
async function calculateStarOfWeek(
  _,
  { startDate, endDate, year, section }: calculateStarOfWeekArgTypes
) {
  let recordRepo = await getAllRecords();

  const dateRange = getDaysArray(startDate, endDate);

  recordRepo = filterRecords({ year, section }, recordRepo,true);
  // recordRepo.forEach(async ({ student }) => {
  //   student.isSow = null;
  //   await student.save();
  // });
  
  for(const {student} of recordRepo){
    student.isSow = null
    await student.save()
    console.log(student.name);
    
  }
  console.log(recordRepo);
  
  let recordRepoDate = recordRepo.filter(record =>
    dateRange.includes(record.date)
  );

  if (recordRepoDate.length === 0) {
    return {
      errors: [{ ...SOMETHING_WRONG, message: `No Entries with in the dates` }]
    };
  }

  const combinedRecord = combineRecordsFunction(recordRepoDate)[0];
  combinedRecord.student.isSow = true;
  await combinedRecord.student.save();
  console.log(combinedRecord.student);
  const stu =await Student.findOne({id:combinedRecord.student.id})
  console.log(stu);
  console.log("from stud");
  console.log(recordRepo);
  
  
  const convertToPDFAsync = promisify<any, { result: string }>(convertToPDF);
  const studentImage = await StudentImage.findOne({
    studentId: combinedRecord.student.id
  });

  const { result } = await convertToPDFAsync({
    data: combinedRecord,
    startDate,
    endDate,
    image: studentImage.image
  });

  return { pdf: result };
}

const getDaysArray = (start: string, end: string): string[] => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  for (
    var arr = [], dt = startDate;
    dt <= endDate;
    dt.setDate(dt.getDate() + 1)
  ) {
    arr.push(new Date(dt));
  }

  return arr.map(v => v.toISOString().slice(0, 10));
};

type combineRecordType = {
  student: Student;
  totalMarks: number;
};
const combineRecordsFunction = (
  records: LeadershipRecord[]
): combineRecordType[] => {
  let combinedR: combineRecordType[] = [];

  records.forEach(({ student }) => {
    if (combinedR.find(cr => cr.student.registerno === student.registerno))
      return;

    const allForStudent = records.filter(
      studentDetail => studentDetail.student.registerno === student.registerno
    );
    const markForStudent = allForStudent.reduce((sum, currentValue) => {
      return (sum += currentValue.points);
    }, 0);
    combinedR.push({ student, totalMarks: markForStudent });
  });

  return combinedR.sort((a, b) => {
    return b.totalMarks - a.totalMarks;
  });
};

type convertToPDFType = {
  data: combineRecordType;
  startDate: string;
  endDate: string;
  image: string;
};
const convertToPDF = (
  { data, startDate, endDate, image }: convertToPDFType,
  callback
) => {
  const doc = new PDFDocument();
  let chunks = [];
  doc.on('data', chunk => {
    chunks.push(chunk);
  });
  doc.image('assets/snsct.png', 18, 33, { width: 60 });
  doc.image('assets/snsorg.png', 493, 33, { height: 58 });

  doc
    .font('Times-Roman')
    .fontSize(24)
    .text('SNS College of Technology', 145, 33, {
      align: 'center',
      width: 325
    });
  doc
    .fontSize(18)
    .text('Coimbatore - 35', 145, 65, { width: 325, align: 'center' });

  doc
    .fontSize(18)
    .text('Department of Computer Science & Engineering (UG & PG)', 18, 132, {
      width: 570,
      align: 'center'
    });
  doc
    .font('Times-Bold')
    .fontSize(18)
    .text('LEADERSHIP BOARD', 18, 189, { width: 570, align: 'center' });
  doc
    .fontSize(18)
    .text('STAR OF THE WEEK', 18, 222, { width: 570, align: 'center' });
  doc
    .font('Times-Roman')
    .fontSize(18)
    .text(`${startDate} to ${endDate}`, 18, 289, {
      width: 570,
      align: 'center'
    });
  doc.text('III CSE C', 18, 322, { width: 570, align: 'center' });

  doc
    .font('Times-Bold')
    .fontSize(18)
    .text(data.student.name.toUpperCase(), 143, 410);

  doc
    .font('Times-Roman')
    .fontSize(10)
    .fontSize(18)
    .text(data.student.registerno, 143, 440);

  doc
    .font('Times-BoldItalic')
    .fontSize(36)
    .text('Congratulations!', 18, 556, { align: 'center', width: 570 });
  doc
    .font('Times-Roman')
    .fontSize(18)
    .text('Class Advisor', 143, 650);
  doc.fontSize(18).text('HoD/Dean', 381, 650);
  if (image) {
    const base64Data = image.split('base64,');
    writeFile('sow.jpeg', base64Data[1], { encoding: 'base64' }, function(err) {
      console.log('File created', err);
      doc.image('sow.jpeg', 350, 370, { width: 116 });
      doc.end();
    });
  } else {
    doc.image('assets/placeholder.png', 350, 370, { width: 116 });
    doc.end();
  }

  doc.on('end', () => {
    const result = Buffer.concat(chunks);
    callback(null, { result: result.toString('base64') });
  });
};

/* ------------------------------GET_STUDENT_TOTAL_MARK----------------------------------------- */
async function getStudentTotalMarks(_, { studentId }) {
  let student: Student[] | Student = null;
  if (studentId) {
    student = await Student.findOne(
      { id: studentId },
      { relations: ['totalMarks'] }
    );
    return [student];
  }
  student = await Student.find({ relations: ['totalMarks'] });
  console.log(student);

  return student;
}

//Mutation
/* ----------------------ADD_RECORD------------------------- */
type addRecordArgTypes = {
  courseId: string;
  facultyId: string;
  studentId: string;
  points: number;
  date: string;
};
async function addRecord(
  _,
  { courseId, facultyId, studentId, points, date }: addRecordArgTypes
) {
  try {
    const course = await Course.findOne({ id: courseId });
    if (!course) return { errors: [COURSE_NOT_FOUND] };

    const faculty = await Faculty.findOne({ id: facultyId });
    if (!faculty) return { errors: [FACULTY_NOT_FOUND] };

    const student = await Student.findOne(
      { id: studentId },
      { relations: ['totalMarks'] }
    );
    if (!student) return { errors: [STUDENT_NOT_FOUND] };

    if (!student.totalMarks)
      student.totalMarks = StudentTotalMarks.create({ totalMarks: points });
    else {
      student.totalMarks.totalMarks += points;
    }

    await student.totalMarks.save();
    await student.save();

    const record = LeadershipRecord.create({
      date,
      student,
      faculty,
      course,
      points
    });

    await record.save();

    return { id: record.id };
  } catch (e) {
    return { errors: [{ ...SOMETHING_WRONG, message: `${e}` }] };
  }
}

/* -------------------------DELETE_ALL_RECORDS---------------------------- */
async function deleteRecords(_, { adminId, recordId }) {
  const admin = await Admin.findOne({ id: adminId });
  if (!admin) return { errors: [ADMIN_NOT_EXISTS] };

  if (!recordId) {
    await LeadershipRecord.delete({});
    return true;
  }
  const record = await LeadershipRecord.findOne(
    { id: recordId },
    { relations: ['student', 'student.totalMarks'] }
  );
  record.student.totalMarks.totalMarks -= record.points;
  await record.student.totalMarks.save();

  if (!record) return { errors: [NO_ACCESS] };
  await record.remove();
}
export default resolvers;
