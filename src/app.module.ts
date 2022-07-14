import { Module } from '@nestjs/common';
import { CategoryController } from './controller/category.controller';
import { ChapterController } from './controller/chapter.controller';
import { CourseController } from './controller/course.controller';
import { ImageController } from './controller/image.controller';
import { LabController } from './controller/lab.controller';
import { SearchController } from './controller/search.controller';
import { StepController } from './controller/step.controller';
import { CategoryService } from './service/category.service';
import { ChapterService } from './service/chapter.service';
import { CourseService } from './service/course.service';
import { ImageService } from './service/image.service';
import { LabService } from './service/lab.service';
import { SearchService } from './service/search.service';
import { StepService } from './service/step.service';

@Module({
  controllers: [CategoryController, CourseController, ChapterController, LabController, StepController, SearchController, ImageController],
  providers: [CategoryService, CourseService, ChapterService, LabService, StepService, SearchService, ImageService],
})
export class AppModule { }