import { Component, ReflectiveInjector, OnInit, InjectionToken } from '@angular/core';

abstract class EmailService {

}
class MandrillService extends EmailService {
  public name: string;
}
class SendGridService extends EmailService { }


class GenericEmailService { }

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular10Project';
  injector: ReflectiveInjector;
  isProd = false;

  ngOnInit(): void {
    // Create a injector; ce ci est un racourcis
    this.injector = ReflectiveInjector.resolveAndCreate([MandrillService, SendGridService]);
    // de ceci 
    /*  this.injector = ReflectiveInjector.resolveAndCreate([
       {provide : MandrillService, useClass: MandrillService},
       {provide: SendGridService, useClass: SendGridService}
      ]);
      */

    this.resolveToken();
    this.injectorCaching();
    this.injectorCachingSharingState();
    this.childInjectorReturnsDifferentInstance();
    this.childInjectorForwardRequestToParent();

    this.configureProviderWhichProvideClass();
    this.configureProviderWhichProvideSimpleValue();
    this.configureProviderWhichProvideUseExisting();
    this.configureProviderWhichProvideUseFactory();

    this.injectionToken();
  }

  resolveToken(): void {
    const mandrillService = this.injector.get(MandrillService);
    console.log(mandrillService);
  }
  injectorCaching(): void {
    const mandrillService1 = this.injector.get(MandrillService);
    const mandrillService2 = this.injector.get(MandrillService);
    console.log(mandrillService1 === mandrillService2); // true
  }
  injectorCachingSharingState(): void {
    // Part one of the application
    const mandrillService1 = this.injector.get(MandrillService);
    mandrillService1.name = 'Bedril Moussakat';

    // Part two of the application
    const mandrillService2 = this.injector.get(MandrillService);
    console.log(mandrillService2.name); // Bedril Moussakat
  }

  childInjectorReturnsDifferentInstance(): void {
    const mandrillService1 = this.injector.get(MandrillService);

    const childInjector = this.injector.resolveAndCreateChild([MandrillService]);
    const mandrillService2 = childInjector.get(MandrillService);

    console.log(mandrillService1 === mandrillService2); // false

  }

  childInjectorForwardRequestToParent(): void {
    const mandrillService1 = this.injector.get(MandrillService);

    const childInjector = this.injector.resolveAndCreateChild([]); // The providers don't provide in injector
    const mandrillService2 = childInjector.get(MandrillService);

    console.log(mandrillService1 === mandrillService2); // true

  }

  configureProviderWhichProvideClass(): void {
    // The provide property is the token and can either be a type, a string, or an instance of something
    // called an InjectionToken.
    // In this case, the token is EmailService and the dependancy is the class SendGridService.
    // But we can switch at MandrillService dependancy class
    const injector = ReflectiveInjector.resolveAndCreate([
      { provide: EmailService, useClass: SendGridService }
    ]);

    // The above is configured so when code requests to the token "EmailService" it returns an instance of the
    // the class SendGridService
    const sendGridService = injector.get(EmailService); // new SendGridService()
    console.log(sendGridService);

  }

  configureProviderWhichProvideSimpleValue(): void {
    const injector = ReflectiveInjector.resolveAndCreate([
      { provide: 'Key', useValue: 'APIKEY12345678900' }
    ]);

    const key = injector.get('Key');
    console.log(key); // APIKEY12345678900


    const injector2 = ReflectiveInjector.resolveAndCreate([
      { provide: 'config', useValue: Object.freeze({ APIKey: 'XYZ1234ABC', APISecret: '555-123-111' }) }
    ]);

    const config = injector2.get('config');
    console.log(config);
    // config.APIKey = 'Toto'; // ERROR TypeError: Cannot assign to read only property 'APIKey' of object
    // console.log(config);

  }

  configureProviderWhichProvideUseExisting(): void {
    const injector = ReflectiveInjector.resolveAndCreate([
      { provide: GenericEmailService, useClass: GenericEmailService },
      { provide: MandrillService, useExisting: GenericEmailService },
      { provide: SendGridService, useExisting: GenericEmailService }
    ]);

    const genericEmailService = injector.get(GenericEmailService);
    console.log(genericEmailService);
    const mandrillService = injector.get(MandrillService);
    console.log(mandrillService);
    const sendGridService = injector.get(SendGridService);
    console.log(sendGridService);

    console.log(genericEmailService === mandrillService && mandrillService === sendGridService); // true
    console.log(genericEmailService === sendGridService); // true


  }

  configureProviderWhichProvideUseFactory(): void {

    const injector = ReflectiveInjector.resolveAndCreate([
      {
        provide: EmailService, useFactory: (): EmailService => {
          if (this.isProd) {
            return new SendGridService();
          }
          else {
            return new MandrillService();
          }
        }
      }
    ]);

    const emailService = injector.get(EmailService);
    console.log(emailService); // new MandrillService()
  }


  injectionToken(): void {

    // There are a number of different types of tokens we can use when configuring providers.
    // we have string token, type token (That we already used previously) and injection token that we demonstrate like so
    const EmailServiceToken1 = new InjectionToken<string>('EmailService');
    const EmailServiceToken2 = new InjectionToken<string>('EmailService');

    console.log(EmailServiceToken2)
    console.log(EmailServiceToken1 === EmailServiceToken2); // false

    const injector = ReflectiveInjector.resolveAndCreate([
      { provide: EmailServiceToken1, useClass: SendGridService },
      { provide: EmailServiceToken2, useClass: MandrillService }
    ]);

    console.log(injector)
    const emailService = injector.get(EmailServiceToken1);
    console.log(emailService); // new SendGridService


  }


}
