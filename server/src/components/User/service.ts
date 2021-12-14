import UserModel, { IUserModel } from './model';
import { IUserService } from './interface';
import { ICourseModel } from '../Course/model';
import CourseService from '../Course/service';

/**
 * @export
 * @implements {IUserModelService}
 */
const UserService: IUserService = {
    /**
     * @param {string} id
     * @returns {Promise < IUserModel >}
     * @memberof UserService
     */
    async findOne(id: string): Promise < IUserModel > {
        try {
            return await UserModel.findOne({
                _id: id
            });
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * @param {string} id
     * @returns {Promise < IUserModel >}
     * @memberof UserService
     */
    async remove(id: string): Promise < IUserModel > {
        try {
            const user: IUserModel = await UserModel.findOneAndRemove({
                _id: id
            });

            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * @param {string} course_id
     * @return {Promise<IUserModel>}
     * @memberof IUserService
     */
    async enrollCourse(id: string, course_id: string): Promise<IUserModel> {
        try {
            const filter = {_id: id};
            const update = {$push: {courses: course_id}};
            const query: IUserModel = await UserModel.findOne({
                _id: id
            });
            for (let i = 0; i< query.courses.length; i++) {
                if (query.courses[i].toString() == course_id) {
                    throw new Error('This student is already enrolled');
                }
            }
            const user: IUserModel = await UserModel.findOneAndUpdate(filter, update);
            return user;

        } catch (error) {
            throw new Error(error);
        }
    },
    /**
     * @param {string} id
     * @param {string} course_id
     * @return {Promise<{pointsEarned: number, finalGrade: number}>}
     * @memberof IUserService
     */
    async finalGrade(id: string, course_id: string): Promise<{pointsEarned: number, finalGrade: number}> {
        try {
            const courseGrades = await CourseService.getStudentGrades(id, course_id);
            let pointsPossible: number = 0;
            let pointsEarned: number = 0;
            for (let i = 0; i < courseGrades.length; i++) {
                pointsPossible +=100;
                pointsEarned += courseGrades[i].grade;
            }
            const finalGrade: number = (pointsEarned/pointsPossible) * 100;
            return {pointsEarned: pointsEarned, finalGrade: finalGrade};
        } catch(error) {
            throw new Error(error.message);
        }
    },
    /*
    * @param {string} id
    * @return {Promise<{course_id: number, pointsEarned: number, finalGrade: number}>}
    * @memberof IUserService
    */
    async reportCard(id: string, body: {avgFilter: number, gradefilter: number, sortCourses: number}): Promise<{course_id: number, pointsEarned: number, finalGrade: number, avgGrade: number}[]> {
        try {
            const user = await UserModel.findById(id).populate({path: 'courses', options: { sort: { '_id': body.sortCourses } } });
            const courses: any = user.courses;
            const gradeInfo: {course_id: number, pointsEarned: number, finalGrade: number, avgGrade: number}[] = [];
            for (let i = 0; i < courses.length; i++) {
                const avg = await CourseService.averageClassGrade(courses[i]._id);
                const info = await UserService.finalGrade(id,courses[i]._id);
                if (info.finalGrade > body.gradefilter || body.gradefilter == 0) {
                    if ((body.avgFilter == 1 && avg < info.finalGrade) || body.avgFilter == 0 || (body.avgFilter == -1 && avg > info.finalGrade)) {
                        gradeInfo.push({course_id: courses[i].id, pointsEarned: info.pointsEarned, finalGrade: info.finalGrade, avgGrade: avg })
                    }
                }
            }
            return gradeInfo;
            
        } catch (error) {
            throw new Error(error.message);
        }
    },
    /**
     * @param {string} course_id
     * @return {Promise<IUserModel>}
     * @memberof IUserService
     */
     async dropCourse(id: string, course_id: string): Promise<IUserModel> {
        try {
            const filter = {_id: id};
            const update = {$pull: {courses: course_id}};

            const user: IUserModel = await UserModel.findOneAndUpdate(filter, update);

            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    },

    /**
     * @param {string} id 
     * @returns {Promise<ICourseModel[]>}
     * @memberof IUserService
     */
    async listCurrentCourses(id: string): Promise<ICourseModel[]> {
        try {
            const user: IUserModel = await UserService.findOne(id);
            var courses: ICourseModel[] = new Array();

            for (let course_id of user.courses) {
                let temp: ICourseModel = await CourseService.findOne(course_id.toString());
                courses.push(temp);
            }

            return courses;
        } catch(error) {
            throw new Error(error.message);
        }
    }
};

export default UserService;
