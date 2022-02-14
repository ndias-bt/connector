import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrgconfigDto } from './orgconfig.dto';

@Controller('orgconfigs')
export class OrgconfigsController {
  @Get()
  getOrgconfigs() {
    return {
      message:
        'In a real example, I would return all of the org configurations',
    };
  }

  @Get(':orgId')
  getMessage(@Param('orgId') orgId) {
    return {
      message: `In a real example, I would return the message with an orgId of ${orgId}`,
    };
  }

  @Post(':orgId')
  createOrgconfig(@Param('orgId') orgId, @Body() orgconfig: OrgconfigDto) {

    const fs = require('fs');

    const content = `${orgId}, ${orgconfig.name}, ${orgconfig.email}\n`;

    try {
      fs.writeFileSync('./orgconfigs.txt', content, { flag: 'a' });
      //file written successfully
    } catch (err) {
      console.error(err);
    }

    console.log(orgconfig);
    return orgconfig;
  }
}
