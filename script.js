/**
 * Felipe Gonçalves dos Santos - Portfólio JS
 * Interatividades, Animação de Canvas e Simulador AWS
 */

document.addEventListener('DOMContentLoaded', () => {
    initNetworkCanvas();
    initAwsSimulator();
    initTerminalTyping();
    initContactForm();
    initSmoothScrolling();
});

/* ==========================================================================
   PARTICLE NETWORK BACKGROUND (CANVAS)
   ========================================================================== */
function initNetworkCanvas() {
    const canvas = document.getElementById('network-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = [];
    const maxParticles = Math.min(60, Math.floor((width * height) / 18000)); // Dynamic count
    const connectionDistance = 120;
    
    // Mouse interaction object
    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }, 100);
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Slow motion for futuristic network ambient feel
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.radius = Math.random() * 1.8 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce on boundaries
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            // Mouse repulsion effect
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.hypot(dx, dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    // Push particles away sutilmente
                    this.x += Math.cos(angle) * force * 1.5;
                    this.y += Math.sin(angle) * force * 1.5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(140, 127, 255, 0.45)';
            ctx.fill();
        }
    }

    class ClickParticle extends Particle {
        constructor(x, y) {
            super();
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.5 + 1.2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.radius = Math.random() * 2.5 + 1.5;
            this.alpha = 1.0;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= 0.015;
        }

        draw() {
            if (this.alpha <= 0) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 153, 0, ${this.alpha})`;
            ctx.fill();
        }
    }

    window.addEventListener('click', (e) => {
        if (mouse.x !== null && mouse.y !== null) {
            // Spawn 10 flying sparks on click
            for (let i = 0; i < 10; i++) {
                particles.push(new ClickParticle(mouse.x, mouse.y));
            }
        }
    });

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Filter expired click particles
        particles = particles.filter(p => {
            if (p instanceof ClickParticle && p.alpha <= 0) return false;
            return true;
        });

        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);

                if (dist < connectionDistance) {
                    // Alpha based on distance
                    const alpha = (1 - dist / connectionDistance) * 0.15;
                    ctx.strokeStyle = `rgba(0, 198, 255, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw lines from mouse to nearest nodes
        if (mouse.x !== null && mouse.y !== null) {
            particles.forEach(p => {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < mouse.radius) {
                    const alpha = (1 - dist / mouse.radius) * 0.08;
                    ctx.strokeStyle = `rgba(255, 153, 0, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(mouse.x, mouse.y);
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                }
            });
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   AWS INTERACTIVE ARCHITECTURE SIMULATOR
   ========================================================================== */
function initAwsSimulator() {
    const nodeBtns = document.querySelectorAll('.node-btn');
    const detailsPanels = document.querySelectorAll('.service-details');

    if (!nodeBtns.length) return;

    nodeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetService = btn.getAttribute('data-service');
            if (!targetService) return;

            // Remove active from all nodes
            nodeBtns.forEach(n => n.classList.remove('active'));
            // Add active to current
            btn.classList.add('active');

            // Hide all details
            detailsPanels.forEach(panel => {
                panel.classList.remove('active');
            });

            // Show active detail panel
            const activePanel = document.getElementById(`details-${targetService}`);
            if (activePanel) {
                activePanel.classList.add('active');
            }

            // Custom flow feedback on the architecture diagram (simulating traffic propagation)
            propagateDataFlow(targetService);
        });
    });
}

/**
 * Visual feedback simulating data propagation through layers
 */
function propagateDataFlow(service) {
    const board = document.getElementById('architecture-board');
    if (!board) return;

    // Create a temporary indicator floating dot to represent request traffic
    const nodes = {
        cloudfront: document.getElementById('node-cloudfront'),
        alb: document.getElementById('node-alb'),
        ec2: document.getElementById('node-ec2'),
        lambda: document.getElementById('node-lambda'),
        rds: document.getElementById('node-rds'),
        s3: document.getElementById('node-s3')
    };

    const activeNode = nodes[service];
    if (!activeNode) return;

    // Trigger a pulse animation on active node SVG
    const svg = activeNode.querySelector('svg');
    if (svg) {
        svg.style.transform = 'scale(1.25)';
        setTimeout(() => {
            svg.style.transform = '';
        }, 300);
    }
}

/* ==========================================================================
   TERMINAL CLI INTERACTIVE SHELL
   ========================================================================== */
function initTerminalTyping() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');

    if (!input || !output) return;

    // Focus input on terminal click
    const terminalBody = document.querySelector('.terminal-body');
    if (terminalBody) {
        terminalBody.addEventListener('click', () => {
            input.focus();
        });
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const commandText = input.value.trim();
            if (commandText === '') return;

            // Log command to history (securely avoiding XSS)
            const cmdLine = document.createElement('p');
            cmdLine.className = 'console-line';
            
            const promptSpan = document.createElement('span');
            promptSpan.className = 'console-prompt';
            promptSpan.textContent = '$ ';
            
            const commandTextNode = document.createTextNode(commandText);
            
            cmdLine.appendChild(promptSpan);
            cmdLine.appendChild(commandTextNode);
            output.appendChild(cmdLine);

            // Process command
            processCommand(commandText.toLowerCase());

            // Clear input and scroll to bottom
            input.value = '';
            output.scrollTop = output.scrollHeight;
        }
    });

    function printLine(text, className = '') {
        const p = document.createElement('p');
        p.className = `console-line ${className}`;
        p.textContent = text;
        output.appendChild(p);
    }

    function processCommand(cmd) {
        const tokens = cmd.split(' ');
        const mainCmd = tokens[0];

        switch(mainCmd) {
            case 'help':
                printLine('Comandos disponíveis:', 'text-muted');
                printLine('  about    - Quem é o Felipe');
                printLine('  skills   - Tecnologias e competências');
                printLine('  contact  - Canais de contato & localização');
                printLine('  projects - Principais projetos desenvolvidos');
                printLine('  aws      - Simula provisionamento de infraestrutura');
                printLine('  clear    - Limpa o terminal');
                break;

            case 'about':
                printLine('Nome: Felipe Gonçalves dos Santos');
                printLine('Foco: Cloud Infrastructure & AWS');
                printLine('Transitando de desenvolvimento frontend/backend para Engenharia de Infraestrutura e DevOps. Sempre focado em construir pilhas estáveis e automações eficientes.');
                break;

            case 'skills':
                printLine('AWS: EC2, S3, RDS, Lambda, IAM, VPC', 'text-success');
                printLine('IaC: Terraform', 'text-success');
                printLine('Backend: Node.js, Express, TypeScript, REST APIs');
                printLine('Frontend: React, HTML5, CSS3, ES6 JavaScript');
                printLine('Ferramentas: Docker, Git, CI/CD (GitHub Actions), Linux Shell');
                break;

            case 'contact':
                printLine('E-mail: felipegz.az@gmail.com', 'text-success');
                printLine('Local: Uberlândia, MG, Brasil');
                printLine('GitHub: https://github.com');
                printLine('LinkedIn: https://linkedin.com');
                break;

            case 'projects':
                printLine('Projetos em Destaque:', 'text-muted');
                printLine('  1. Pipeline IaC (Terraform + AWS VPC/EC2 + GitHub Actions)');
                printLine('  2. API REST Serverless (Node.js + Express + Lambda + RDS)');
                printLine('  3. Dashboard Realtime (React + CSS Grid + WebSockets)');
                printLine('Role a página para ver os cards detalhados.');
                break;

            case 'aws':
                printLine('Iniciando deploy de infraestrutura simulada...', 'text-muted');
                setTimeout(() => {
                    printLine('[Terraform] Criando recursos declarados...', 'text-muted');
                    printLine('[AWS] aws_vpc.main: Creating... [ID: vpc-0f52]', 'text-success');
                }, 300);
                setTimeout(() => {
                    printLine('[AWS] aws_subnet.public: Creating...', 'text-success');
                    printLine('[AWS] aws_instance.web: Creating... [AMI: ami-0c55b1]', 'text-success');
                }, 800);
                setTimeout(() => {
                    printLine('[AWS] aws_instance.web: Creation complete [ID: i-09ea]', 'text-success');
                    printLine('[ALB] Registrando instâncias no Target Group... HEALTHY', 'text-success');
                    printLine('Stack provisionada com sucesso em us-east-1!', 'text-success');
                    output.scrollTop = output.scrollHeight;
                }, 1500);
                break;

            case 'clear':
                output.innerHTML = '';
                break;

            default:
                printLine(`Comando não reconhecido: "${mainCmd}". Digite 'help' para obter a lista de comandos disponíveis.`, 'text-muted');
        }
    }
}

/* ==========================================================================
   CONTACT FORM SUBMISSION WITH MICRO-ANIMATIONS
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('btn-submit-form');

    if (!form || !feedback) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Animate button sending state
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="cursor">_</span> Enviando...';

        // Simulate async API call
        setTimeout(() => {
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Show success alert and hide it later
            feedback.classList.remove('hidden');
            
            setTimeout(() => {
                feedback.classList.add('hidden');
            }, 6000);
        }, 1500);
    });
}

/* ==========================================================================
   SMOOTH SCROLLING FOR NAVLINKS WITH OFFSET ADJUSTMENTS
   ========================================================================== */
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();
            
            const headerHeight = 70; // Header height offset
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });
}
