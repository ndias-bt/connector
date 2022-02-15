import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Customer } from './interfaces/customer.interface';

@Injectable()
export class AppService {
  private customer: Customer;
  private config: ConfigService;

  setCustomer(customer: Customer): void {
    this.customer = customer;
  }

  getTransactions(
    object: string | string[] | undefined,
    object_id: string | string[] | undefined,
  ): string {
    // let html = '<h2>Last Three Transactions for ' + this.customer.id + ':</h2>';
    let html = '';
    if (object != undefined && object_id != undefined) {
      html +=
        '<h2>Last Three Transactions for ' +
        object +
        ' ' +
        object_id +
        ':</h2>';
    } else {
      html += '<h2>Last Three Transactions for:</h2>';
    }
    html += '<table width="100%">';
    html += '<tr><th>Date</th><th>Description</th><th>Amount</th></tr>';
    html += '<tr><th>' + Date().toLocaleLowerCase('en-US') + '</th><th>Nespresso</th><th>$25.88</th></tr>';
    html += '<tr><th>' + Date().toLocaleLowerCase('en-US') + '</th><th>Ralphs</th><th>$101.22</th></tr>';
    html += '<tr><th>' + Date().toLocaleLowerCase('en-US') + '</th><th>Best Buy</th><th>$722.22</th></tr>';
    html += '</table>';
    return html;
  }

  getForm(): string {
    const fs = require('fs');
    const orgId = 'JQH';
    const orgConfig = [];

    try {
      const data = fs.readFileSync('orgconfigs.txt', 'utf8');

      data.split(/\r?\n/).forEach((line) => {
        const lineData = line.split(/,\s*/);
        const orgId = lineData[0];
        const name = lineData[1];
        const email = lineData[2];

        orgConfig[orgId] = {
          name: name,
          email: email,
        };
      });
    } catch (err) {
      console.error(err);
    }

    console.log(orgConfig);

    let html = '<h2>Sample Config Form</h2>';
    const url = this.config.get<string>('url');

    html += 'Current config for orgId=' + orgId + '<br>\n';
    html += 'name=' + orgConfig[orgId].name + '<br>\n';
    html += 'email=' + orgConfig[orgId].email + '<br>\n';
    html += '<hr>\n';

    html += `<form method="POST" action="${url}/orgconfigs/${orgId}">`;
    html += '<label for="name">Name:</label>';
    html += '<input type="text" id="name" name="name" value="John Smith">';
    html += '<br>';
    html += '<label for="email">Email:</label>';
    html += '<input type="text" id="email" name="email" value="">';
    html += '<br>';
    html += '<input type="submit">';
    html += '</form>';
    return html;
  }
}
