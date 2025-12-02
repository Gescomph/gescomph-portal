import { Injectable } from '@angular/core';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './driver.js.custom.css';

@Injectable({ providedIn: 'root' })
export class DriverJsService {

  private stepsByView: Record<string, any[]> = {};

  registerSteps(view: string, steps: any[]) {
    this.stepsByView[view] = steps;
  }

  async run(view: string) {
    const steps = this.stepsByView[view];

    if (!steps || !Array.isArray(steps)) {
      console.warn(`❗ No hay steps registrados para ${view}`);
      return;
    }

    const filtered = steps.filter(step => {
      const exists = document.querySelector(step.element);
      if (!exists) console.warn(`Step removido: ${step.element}`);
      return !!exists;
    });

    if (filtered.length === 0) {
      console.warn(`❗ No hay steps válidos`);
      return;
    }

    const drv: any = driver({
      animate: true,
      allowClose: true,
      showProgress: true,
      steps: filtered
    });

    drv.drive();
  }
}
