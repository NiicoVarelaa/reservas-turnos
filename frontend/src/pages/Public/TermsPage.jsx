import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Shield, FileText } from 'lucide-react'

const SECTIONS = [
  {
    title: '1. Aceptación de los Términos',
    content: `Al acceder y utilizar la plataforma Smile Book (en adelante, "el Servicio"), el usuario acepta estos Términos y Condiciones en su totalidad. Si no está de acuerdo con alguno de ellos, le solicitamos que no utilice el Servicio. El uso continuado del Servicio implica la aceptación de cualquier modificación a los presentes términos.`,
  },
  {
    title: '2. Descripción del Servicio',
    content: `Smile Book es una plataforma de reservas online que permite a los pacientes agendar turnos con profesionales de la salud de forma rápida y segura. A través del Servicio, el usuario podrá consultar servicios disponibles, seleccionar fecha y horario, y confirmar su reserva, la cual será confirmada por WhatsApp y/o correo electrónico.`,
  },
  {
    title: '3. Reservas y Cancelaciones',
    content: `Las reservas realizadas a través de la plataforma están sujetas a disponibilidad. El paciente se compromete a asistir al turno reservado o a cancelarlo con al menos 24 horas de anticipación para permitir que otro paciente pueda ocupar ese espacio. Las cancelaciones tardías o las inasistencias sin aviso podrán estar sujetas a una penalización según el criterio del profesional.`,
  },
  {
    title: '4. Pagos',
    content: `Para aquellos servicios que lo requieran, el pago se procesará mediante Stripe de forma segura. El paciente autoriza el cargo por el monto correspondiente al servicio seleccionado. Los reembolsos serán gestionados según la política de cada establecimiento y las condiciones de Stripe aplicables.`,
  },
  {
    title: '5. Responsabilidad del Usuario',
    content: `El usuario es responsable de proporcionar información veraz y completa al momento de realizar una reserva. Smile Book no se hace responsable por los datos incorrectos o incompletos proporcionados por el usuario, ni por las consecuencias derivadas de los mismos.`,
  },
  {
    title: '6. Comunicaciones',
    content: `Al realizar una reserva, el usuario acepta recibir comunicaciones por WhatsApp, correo electrónico o teléfono relacionadas con su turno: confirmaciones, recordatorios, reprogramaciones o cancelaciones. Estas comunicaciones son esenciales para el correcto funcionamiento del Servicio.`,
  },
  {
    title: '7. Propiedad Intelectual',
    content: `Todo el contenido de la plataforma, incluyendo textos, imágenes, logotipos y diseño, es propiedad de Smile Book o de sus licenciantes y está protegido por las leyes de propiedad intelectual. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.`,
  },
  {
    title: '8. Privacidad de los Datos',
    content: `El tratamiento de los datos personales se realiza conforme a nuestra Política de Privacidad. Al utilizar el Servicio, el usuario acepta el tratamiento de sus datos de acuerdo con dicha política.`,
  },
  {
    title: '9. Limitación de Responsabilidad',
    content: `Smile Book actúa como intermediario tecnológico entre pacientes y profesionales. No se hace responsable por el resultado de los tratamientos o servicios profesionales prestados. La responsabilidad por la prestación del servicio es exclusiva del profesional y del establecimiento que lo brinda.`,
  },
  {
    title: '10. Modificaciones',
    content: `Smile Book se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán publicados en esta página y entrarán en vigencia desde su publicación. El uso continuado del Servicio después de dichos cambios constituye la aceptación de los mismos.`,
  },
  {
    title: '11. Ley Aplicable y Jurisdicción',
    content: `Estos Términos y Condiciones se rigen por las leyes de la República Argentina. Para cualquier controversia que surja en relación con el Servicio, las partes se someten a los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.`,
  },
  {
    title: '12. Contacto',
    content: `Ante cualquier consulta sobre estos Términos y Condiciones, podés comunicarte con nosotros a través del formulario de contacto de la página principal o escribiendo a hola@smilebook.com.`,
  },
]

export default function TermsPage() {
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
              <FileText className="w-7 h-7" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Términos y Condiciones</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Última actualización: agosto de 2026
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border bg-background/80 p-8 space-y-8 shadow-sm">
              {SECTIONS.map((section) => (
                <div key={section.title}>
                  <h2 className="text-xl font-semibold mb-3 flex items-start gap-2">
                    <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              ))}
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