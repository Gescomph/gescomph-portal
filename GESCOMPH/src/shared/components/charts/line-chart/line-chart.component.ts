import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title,
  Filler,
  ChartConfiguration,
  TooltipItem
} from 'chart.js';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Title,
  Filler
);

@Component({
  selector: 'app-line-chart',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit, OnChanges {
  @Input() title: string = '';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartConfig!: ChartConfiguration<'line'>;

  ngOnInit(): void {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['labels'] || changes['data']) {
      console.log('🟩 Cambios detectados en LineChart:', {
        labels: this.labels,
        data: this.data
      });
      this.buildChart();

      // 🔁 Si el chart ya existe, actualízalo
      if (this.chart) {
        this.chart.update();
      }
    }
  }

  private buildChart(): void {
    this.lineChartConfig = {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: 'Ingresos',
            data: this.data,
            borderColor: '#666',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#000',
            backgroundColor: (ctx) => {
              const chart = ctx.chart.ctx;
              const gradient = chart.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, 'rgba(150,150,150,0.6)');
              gradient.addColorStop(1, 'rgba(255,255,255,0)');
              return gradient;
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          subtitle: {
            display: true,
            text: 'Últimos 6 meses',
            align: 'start',
            font: { size: 13 },
            color: '#777'
          },
          tooltip: {
            enabled: true,
            usePointStyle: true,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#000',
            bodyColor: '#000',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            borderColor: '#999',
            borderWidth: 1,
            displayColors: false,
            padding: 12,
            caretPadding: 10,
            callbacks: {
              title: (items: TooltipItem<'line'>[]) => items[0].label,
              label: (item: TooltipItem<'line'>) => {
                const valor = item.parsed.y.toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                });
                return `Ingresos: ${valor}`;
              }
            },
            position: 'average'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${(Number(value) / 1_000_000).toFixed(1)}M`
            },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: { grid: { display: false } }
        }
      }
    };
  }
}
