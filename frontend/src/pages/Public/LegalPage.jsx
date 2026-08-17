import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Scale, Lock, Cookie } from 'lucide-react'

const SECTIONS = [
  {
    icon: 'scale',
    title: '1. Información Legal',
    content: `Smile Book es una plataforma digital de reservas de turnos para profesionales de la salud, operada por Clínica Dental Sonrisa, con domicilio en Av. Siempre Viva 123, Buenos Aires, Argentina, e-mail de contacto: hola@smilebook.com. El acceso y uso de este sitio web implica la aceptación de las presentes condiciones legales.`,
  },
  {
    icon: 'scale',
    title: '2. Objeto',
    content: `El presente documento regula el uso del sitio web y de los servicios de reserva online ofrecidos por Smile Book. A través de la plataforma, los pacientes pueden consultar servicios, seleccionar profesionales, fecha y horario, y gestionar sus turnos de manera segura.`,
  },
  {
    icon: 'lock',
    title: '3. Política de Privacidad',
    content: `En cumplimiento de la Ley N° 25.326 de Protección de los Datos Personales de la República Argentina, le informamos que los datos personales que nos proporciona al registrarse o reservar un turno son incorporados a una base de datos cuyo responsable es Clínica Dental Sonrisa. Sus datos serán utilizados exclusivamente para: gestionar las reservas solicitadas, enviar confirmaciones y recordatorios de turnos, y comunicar novedades relevantes del servicio si usted lo autoriza.`,
  },
  {
    icon: 'lock',
    title: '4. Finalidad y Cesión de Datos',
    content: `Los datos recolectados no serán cedidos, vendidos ni compartidos con terceros, salvo cuando sea necesario para la prestación del servicio (por ejemplo, la pasarela de pago Stripe para procesar transacciones) o cuando exista obligación legal. El usuario podrá ejercer los derechos de acceso, rectificación, actualización y supresión de sus datos personales comunicándose a hola@smilebook.com o a través de los canales de contacto de la plataforma.`,
  },
  {
    icon: 'cookie',
    title: '5. Política de Cookies',
    content: `Este sitio web utiliza cookies propias y de terceros con el fin de garantizar el correcto funcionamiento de la plataforma, recordar las preferencias de navegación y analizar el uso del sitio de forma anónima para mejorar la experiencia. Podrá configurar o deshabilitar las cookies desde la configuración de su navegador. La desactivación de cookies técnicas puede afectar el correcto funcionamiento del proceso de reserva.`,
  },
  {
    icon: 'lock',
    title: '6. Seguridad de los Datos',
    content: `Adoptamos medidas técnicas y organizativas adecuadas para proteger sus datos personales contra accesos no autorizados, pérdida o alteración. Los pagos realizados a través de la plataforma son procesados por Stripe bajo estándares de seguridad PCI-DSS; Smile Book no almacena datos de tarjetas de crédito.`,
  },
  {
    icon: 'scale',
    title: '7. Propiedad Intelectual',
    content: `Los contenidos del sitio, incluyendo textos, imágenes, logotipos, gráficos y software, son propiedad de Smile Book o de sus titulares legítimos y están protegidos por la normativa de propiedad intelectual. Queda prohibida su reproducción total o parcial sin autorización expresa.`,
  },
  {
    icon: 'scale',
    title: '8. Responsabilidad',
    content: `Smile Book no se hace responsable por la información proporcionada por los pacientes al momento de la reserva ni por los resultados clínicos de los tratamientos, siendo el profesional interviniente el responsable de la práctica profesional. El sitio podría contener enlaces a sitios externos cuya política de privacidad es ajena a la presente.`,
  },
  {
    icon: 'scale',
    title: '9. Modificaciones',
    content: `Nos reservamos el derecho de actualizar el presente aviso legal y la política de privacidad en función de cambios normativos o de la evolución de la plataforma. Las modificaciones serán publicadas en esta página y entrarán en vigencia desde su publicación.`,
  },
  {
    icon: 'scale',
    title: '10. Legislación Aplicable',
    content: `Estos términos legales se rigen por la legislación de la República Argentina. Para cualquier controversia que pudiera derivarse del uso del sitio, las partes se someten a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.`,
  },
  {
    icon: 'scale',
    title: '11. Contacto',
    content: `Ante cualquier consulta sobre este aviso legal, la política de privacidad o el tratamiento de sus datos personales, podrá escribirnos a hola@smilebook.com o utilizar el formulario de contacto disponible en la página principal.`,
  },
]

const ICONS = {
  scale: Scale,
  lock: Lock,
  cookie: Cookie,
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Smile Book" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg">Smile Book</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Iniciar Sesión</Button>
            </Link>
            <Link to="/book">
              <Button size="sm">Reservar Turno</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Scale className="w-7 h-7" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Legales</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Aviso legal, política de privacidad y uso de cookies
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border bg-background/80 p-8 space-y-8 shadow-sm">
              {SECTIONS.map((section) => {
                const Icon = ICONS[section.icon] || Scale
                return (
                  <div key={section.title}>
                    <h2 className="text-xl font-semibold mb-3 flex items-start gap-2">
                      <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-10">
              <Link to="/book">
                <Button size="lg">
                  Reservar Turno
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#002a5e] text-slate-300">
        <div className="border-t border-slate-800">
          <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Smile Book. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="hover:text-slate-300 transition-colors">Términos y Condiciones</Link>
              <Link to="/legal" className="hover:text-slate-300 transition-colors">Política de Privacidad</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}