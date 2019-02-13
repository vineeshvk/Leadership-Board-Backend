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

const resolvers = {
	Query: {
		viewRecords,
		viewRecordsCSV: viewRecords,
		calculateStarOfWeek
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
	leadershipRecord: LeadershipRecord[]
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

	recordRepo = filterRecords({ year, section }, recordRepo);
	let recordRepoDate = recordRepo.filter(record =>
		dateRange.includes(record.date)
	);
	console.log('dateRepo', recordRepoDate);

	if (recordRepoDate.length === 0) {
		return {
			errors: [{ ...SOMETHING_WRONG, message: `No Entries with in the dates` }]
		};
	}

	const combinedRecord = combineRecordsFunction(recordRepoDate)[0];

	const convertToPDFAsync = promisify<any, { result: string }>(convertToPDF);

	const { result } = await convertToPDFAsync(combinedRecord);

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

const convertToPDF = (data: combineRecordType, callback) => {
	const doc = new PDFDocument();
	let chunks = [];
	doc.on('data', chunk => {
		chunks.push(chunk);
	});

	doc.fontSize(35).text('SNS College of Technology', 100);
	doc
		.fontSize(18)
		.text('Department of Computer Science & Engineering (UG & PG)', 60);
	doc
		.font('Helvetica-Bold')
		.fontSize(15)
		.text('LEADERSHIP BOARD', 240, 180);
	doc
		.font('Helvetica-Bold')
		.fontSize(15)
		.text('STAR OF THE WEEK', 244, 210);

	doc.fontSize(10).text('(' + data.student.registerno + ')', 150, 330);
	doc.fontSize(10).text(data.student.name, 250, 330);

	doc.fontSize(40).text('CONGRATULATIONS', 119, 500);
	doc.fontSize(10).text('Class Advisor', 100, 600);
	doc.fontSize(10).text('HoD/Dean', 450, 600);

	if (data.student.image) {
		const base64Data = data.student.image.split('base64,');
		writeFile('sow.jpeg', base64Data[1], { encoding: 'base64' }, function(err) {
			console.log('File created', err);
			doc.image('sow.jpeg', 390, 290, { width: 80 });
			doc.end();
		});
	} else {
		doc.end();
	}

	doc.on('end', () => {
		const result = Buffer.concat(chunks);
		callback(null, { result: result.toString('base64') });
	});
};

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

		const student = await Student.findOne({ id: studentId });
		if (!student) return { errors: [STUDENT_NOT_FOUND] };

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
	const record = await LeadershipRecord.findOne({ id: recordId });

	if (!record) return { errors: [NO_ACCESS] };
	await record.remove();
}
export default resolvers;
