import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, FileText, Image } from "lucide-react";
import { toast } from "sonner";


interface MCQQuestionConfig {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  difficulty: string;
  unit: string;
}

interface MCQSection {
  id: string;
  name: string;
  questions: number;
  marksPerQuestion: number;
  difficulty: string;
  units: string[];
  customQuestions: MCQQuestionConfig[];
}

const MCQGenerator = () => {
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (!authToken || !userData) {
        // Store current path for redirect after login
        sessionStorage.setItem('redirectAfterLogin', '/mcq-generator');
        navigate('/login');
        return;
      }
    };

    checkAuth();
  }, [navigate]);
  

  const [subjectName, setSubjectName] = useState("");
  const [university, setUniversity] = useState("");
  const [examDate, setExamDate] = useState("");
  const [duration, setDuration] = useState("");
  const [syllabusImage, setSyllabusImage] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [sections, setSections] = useState<MCQSection[]>([
    {
      id: "1",
      name: "Section A",
      questions: 10,
      marksPerQuestion: 1,
      difficulty: "Easy",
      units: ["UNIT I"],
      customQuestions: []
    }
  ]);

  const handleSyllabusUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSyllabusImage(e.target?.result as string);
        toast.success("Syllabus uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setHeaderImage(e.target?.result as string);
        toast.success("Header image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const addSection = () => {
    const newSection: MCQSection = {
      id: Date.now().toString(),
      name: `Section ${String.fromCharCode(65 + sections.length)}`,
      questions: 5,
      marksPerQuestion: 1,
      difficulty: "Easy",
      units: [],
      customQuestions: []
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== id));
    }
  };

  const updateSection = (id: string, field: keyof MCQSection, value: any) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const toggleUnit = (sectionId: string, unit: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const units = section.units.includes(unit)
          ? section.units.filter(u => u !== unit)
          : [...section.units, unit];
        return { ...section, units };
      }
      return section;
    }));
  };

  const addCustomMCQ = (sectionId: string) => {
    const newQuestion: MCQQuestionConfig = {
      id: Date.now().toString(),
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      marks: 1,
      difficulty: "Medium",
      unit: "UNIT I"
    };
    
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          customQuestions: [...section.customQuestions, newQuestion]
        };
      }
      return section;
    }));
  };

  const removeCustomMCQ = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          customQuestions: section.customQuestions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
  };

  const updateCustomMCQ = (sectionId: string, questionId: string, field: keyof MCQQuestionConfig, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          customQuestions: section.customQuestions.map(q =>
            q.id === questionId ? { ...q, [field]: value } : q
          )
        };
      }
      return section;
    }));
  };

  const updateMCQOption = (sectionId: string, questionId: string, optionIndex: number, value: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          customQuestions: section.customQuestions.map(q => {
            if (q.id === questionId) {
              const newOptions = [...q.options];
              newOptions[optionIndex] = value;
              return { ...q, options: newOptions };
            }
            return q;
          })
        };
      }
      return section;
    }));
  };

  const totalMarks = sections.reduce((total, section) => 
    total + (section.questions * section.marksPerQuestion), 0
  );

  const handleGenerate = () => {
    if (!subjectName.trim()) {
      toast.error("Please enter a subject name");
      return;
    }
    
    const config = {
      subjectName,
      university,
      examDate,
      duration,
      headerImage,
      sections,
      totalMarks,
      type: 'mcq'
    };
    sessionStorage.setItem('questionPaperConfig', JSON.stringify(config));
    
    console.log("Generating MCQ paper with:", config);
    toast.success("MCQ question paper generated successfully!");
    navigate("/result");
  };

  const units = ["UNIT I", "UNIT II", "UNIT III", "UNIT IV", "UNIT V"];

  return (
    <div className="min-h-screen bg-gradient-hero">
<nav className="bg-white border-b border-slate-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Left - Back link */}
      <Link to="/" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700">
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      {/* Right - Logo */}
      <div className="flex items-center space-x-2">
        <img
          src="/vinathaal%20logo.png"
          alt="Vinathaal Logo"
          className="h-16 w-auto object-contain"
        />
      </div>
    </div>
  </div>
</nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Syllabus Upload Card */}
    <Card className="bg-gradient-card border-accent/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2 text-primary">
          <FileText className="w-5 h-5" />
          <span>Upload Syllabus (Optional)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gradient-subtle">
          <input
            type="file"
            accept="image/*"
            onChange={handleSyllabusUpload}
            className="hidden"
            id="syllabus-upload"
          />
          <label htmlFor="syllabus-upload" className="cursor-pointer">
            {syllabusImage ? (
              <div className="space-y-4">
                <img src={syllabusImage} alt="Syllabus preview" className="max-h-32 mx-auto rounded-lg shadow-md" />
                <p className="text-success font-medium">Syllabus uploaded successfully!</p>
              </div>
            ) : (
              <>
                <FileText className="w-12 h-12 mx-auto text-accent mb-4" />
                <p className="text-text-primary font-medium">Click to upload your syllabus</p>
                <p className="text-sm text-text-secondary mt-2">PNG, JPG up to 10MB</p>
              </>
            )}
          </label>
        </div>
      </CardContent>
    </Card>

    {/* Header Image Upload Card */}
    <Card className="bg-gradient-card border-accent/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2 text-primary">
          <Image className="w-5 h-5" />
          <span>Upload Custom Header Image (Optional)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gradient-subtle">
          <input
            type="file"
            accept="image/*"
            onChange={handleHeaderImageUpload}
            className="hidden"
            id="header-upload"
          />
          <label htmlFor="header-upload" className="cursor-pointer">
            {headerImage ? (
              <div className="space-y-4">
                <img src={headerImage} alt="Header preview" className="max-h-32 mx-auto rounded-lg shadow-md" />
                <p className="text-success font-medium">Header image uploaded successfully!</p>
              </div>
            ) : (
              <>
                <Image className="w-12 h-12 mx-auto text-accent mb-4" />
                <p className="text-text-primary font-medium">Click to upload your university/institution header</p>
                <p className="text-sm text-text-secondary mt-2">PNG, JPG up to 10MB</p>
              </>
            )}
          </label>
        </div>
      </CardContent>
    </Card>
  </div>
</div>


<div className="max-w-4xl mx-auto mb-8">
  <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Configure MCQ Question Paper</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">University/Institution</Label>
                <Input
                  id="university"
                  placeholder="e.g., Anna University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Name</Label>
                <Input
                  id="subject"
                  placeholder="e.g., MATRICES AND CALCULUS"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Exam Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 3 Hours"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">MCQ Sections Configuration</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-green-600 font-medium">
                    Total Marks: {totalMarks}
                  </span>
                  <Button onClick={addSection} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div key={section.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Section Configuration</h4>
                      {sections.length > 1 && (
                        <Button
                          onClick={() => removeSection(section.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label>Section Name</Label>
                        <Input
                          value={section.name}
                          onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                          placeholder="Section A"
                        />
                      </div>
                      <div>
                        <Label>No. of Questions</Label>
                        <Input
                          type="number"
                          value={section.questions}
                          onChange={(e) => updateSection(section.id, 'questions', parseInt(e.target.value) || 1)}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label>Marks per Question</Label>
                        <Input
                          type="number"
                          value={section.marksPerQuestion}
                          onChange={(e) => updateSection(section.id, 'marksPerQuestion', parseInt(e.target.value) || 1)}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label>Difficulty Level</Label>
                        <Select
                          value={section.difficulty}
                          onValueChange={(value) => updateSection(section.id, 'difficulty', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Units to Cover</Label>
                      <div className="flex flex-wrap gap-2">
                        {units.map((unit) => (
                          <Button
                            key={unit}
                            onClick={() => toggleUnit(section.id, unit)}
                            variant={section.units.includes(unit) ? "default" : "outline"}
                            size="sm"
                            className={section.units.includes(unit) ? "bg-slate-900" : ""}
                          >
                            {unit}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom MCQ Questions */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Custom MCQ Questions (Optional)</h5>
                        <Button
                          onClick={() => addCustomMCQ(section.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add MCQ
                        </Button>
                      </div>
                      
                      {section.customQuestions.length > 0 && (
                        <div className="space-y-4">
                          {section.customQuestions.map((question) => (
                            <div key={question.id} className="border border-slate-100 rounded p-4 bg-slate-50">
                              <div className="flex justify-between items-start mb-3">
                                <h6 className="text-sm font-medium text-slate-700">Custom MCQ Question</h6>
                                <Button
                                  onClick={() => removeCustomMCQ(section.id, question.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <Label>Question Text</Label>
                                  <Textarea
                                    value={question.text}
                                    onChange={(e) => updateCustomMCQ(section.id, question.id, 'text', e.target.value)}
                                    placeholder="Enter your MCQ question here..."
                                    className="min-h-[80px]"
                                  />
                                </div>
                                
                                <div>
                                  <Label>Options</Label>
                                  <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                      <div key={optionIndex} className="flex items-center space-x-2">
                                        <Input
                                          value={option}
                                          onChange={(e) => updateMCQOption(section.id, question.id, optionIndex, e.target.value)}
                                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                        />
                                        <Button
                                          variant={question.correctAnswer === optionIndex ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => updateCustomMCQ(section.id, question.id, 'correctAnswer', optionIndex)}
                                          className="whitespace-nowrap"
                                        >
                                          {question.correctAnswer === optionIndex ? "Correct" : "Mark Correct"}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <Label>Marks</Label>
                                    <Input
                                      type="number"
                                      value={question.marks}
                                      onChange={(e) => updateCustomMCQ(section.id, question.id, 'marks', parseInt(e.target.value) || 1)}
                                      min="1"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label>Difficulty</Label>
                                    <Select
                                      value={question.difficulty}
                                      onValueChange={(value) => updateCustomMCQ(section.id, question.id, 'difficulty', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label>Unit</Label>
                                    <Select
                                      value={question.unit}
                                      onValueChange={(value) => updateCustomMCQ(section.id, question.id, 'unit', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {units.map((unit) => (
                                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        <div className="text-center">
          <Button 
            onClick={handleGenerate}
            size="lg" 
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800"
          >
            <FileText className="w-5 h-5 mr-2" />
            Generate MCQ Paper
          </Button>
        </div>
      </div>
  );
};

export default MCQGenerator;
