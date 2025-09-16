import React from 'react'
import { Link } from 'react-router-dom'
import { 
  HomeIcon, 
  WrenchScrewdriverIcon, 
  UserGroupIcon, 
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const Home = () => {
  const features = [
    {
      icon: <HomeIcon className="h-8 w-8" />,
      title: 'Serviços Domésticos',
      description: 'Encontre profissionais qualificados para limpeza, jardinagem, manutenção e muito mais.'
    },
    {
      icon: <WrenchScrewdriverIcon className="h-8 w-8" />,
      title: 'Profissionais Verificados',
      description: 'Todos os prestadores passam por verificação e avaliação contínua dos clientes.'
    },
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: 'Comunidade Confiável',
      description: 'Sistema de avaliações e comentários para garantir a melhor experiência.'
    },
    {
      icon: <StarIcon className="h-8 w-8" />,
      title: 'Qualidade Garantida',
      description: 'Profissionais com as melhores avaliações e experiência comprovada.'
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'Descreva o Serviço',
      description: 'Conte-nos o que você precisa e quando precisa.'
    },
    {
      number: '2',
      title: 'Receba Propostas',
      description: 'Profissionais qualificados enviarão suas propostas.'
    },
    {
      number: '3',
      title: 'Escolha o Melhor',
      description: 'Compare preços, avaliações e escolha o profissional ideal.'
    },
    {
      number: '4',
      title: 'Serviço Realizado',
      description: 'Acompanhe o progresso e avalie o serviço realizado.'
    }
  ]

  return (
    <div className="min-h-screen">


      {/* Hero Section */}
      <section className="hero min-h-[80vh] bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-montserrat font-bold mb-6">
              Conectamos você aos melhores
              <span className="text-primary"> profissionais domésticos</span>
            </h1>
            <p className="text-xl mb-8 text-base-content/70 font-lato">
              Encontre prestadores de serviços qualificados para sua casa.
              Rápido, seguro e confiável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary btn-lg">
                Começar Agora
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
              <Link to="/login" className="btn-secondary btn-lg">
                Sou Prestador
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-montserrat font-bold mb-4">Por que escolher o Serviço em Casa?</h2>
            <p className="text-xl text-base-content/70 font-lato">
              A plataforma que conecta clientes e prestadores de forma segura e eficiente
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="card-body text-center">
                  <div className="text-primary mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="card-title justify-center text-lg mb-2 font-montserrat">
                    {feature.title}
                  </h3>
                  <p className="text-base-content/70 font-lato">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-montserrat font-bold mb-4">Como funciona</h2>
            <p className="text-xl text-base-content/70 font-lato">
              Em poucos passos você encontra o profissional ideal
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-montserrat font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-base-content/70 font-lato">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-content">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-montserrat font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-8 opacity-90 font-lato">
            Junte-se a milhares de clientes e prestadores satisfeitos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-secondary btn-lg">
              Criar Conta Grátis
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg text-primary-content border-primary-content hover:bg-primary-content hover:text-primary font-montserrat">
              Fazer Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <aside>
          <div className="text-2xl font-bold text-primary mb-2">Serviço em Casa</div>
          <p className="font-semibold">
            Conectando pessoas aos melhores serviços domésticos
          </p>
          <p>Copyright © 2024 - Todos os direitos reservados</p>
        </aside>
      </footer>
    </div>
  )
}

export default Home