import CourseModel, { ICourseModel } from './model';
import { ICourseService } from './interface';

/**
 * @export
 * @implements {ICourseModelService}
 */
const CourseService: ICourseService = {
    /**
     * @param {string} id
     * @returns {Promise < ICourseModel >}
     * @memberof CourseService
     */
    async findOne(id: string): Promise < ICourseModel > {
        try {
            return await CourseModel.findOne({
                _id: id
            });
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * @param {ICourseModel} body
     * @returns {Promise < ICourseModel >}
     * @memberof CourseService
     */
     async add(body: ICourseModel, professor_id: string): Promise < ICourseModel > {
        try {
            const course: ICourseModel = new CourseModel({
                _id: body._id,
                title: body.title,
                description: body.description,
                professor: professor_id
            });

            const query: ICourseModel = await CourseModel.findOne({
                _id: body._id
            });

            if (query) {
                throw new Error('This course already exists');
            }

            const saved: ICourseModel = await course.save();

            return saved;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * @param {string} student_id
     * @param {string} course_id
     * @returns {Promise < ICourseModel >}
     * @memberof CourseService
     */
     async addStudent(student_id: string, course_id: string): Promise < ICourseModel > {
        try {
            const filter = {_id: course_id};
            const update = {$push: {students: student_id}};

            const course: ICourseModel = await CourseModel.findOneAndUpdate(filter, update);

            return course;
        } catch (error) {
            throw new Error(error.message);
        }
    },    
   
    /**
     * @param {string} student_id
     * @param {string} course_id
     * @returns {Promise < ICourseModel >}
     * @memberof CourseService
     */
     async removeStudent(student_id: string, course_id: string): Promise < ICourseModel > {
        try {
            const filter = {_id: course_id};
            const update = {$pull : {students: student_id}};

            const course: ICourseModel = await CourseModel.findOneAndUpdate(filter, update);

            return course;
        } catch (error) {
            throw new Error(error.message);
        }
    },    

    /**
     * @param {string} id
     * @returns {Promise < ICourseModel >}
     * @memberof CourseService
     */
    async remove(id: string): Promise < ICourseModel > {
        try {
            const course: ICourseModel = await CourseModel.findOneAndRemove({
                _id: id
            });

            return course;
        } catch (error) {
            throw new Error(error.message);
        }
    }
};

export default CourseService;