'use client';

import { useState } from 'react';

const InstituteView = () => {
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showLiveClassModal, setShowLiveClassModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showPeerReviewModal, setShowPeerReviewModal] = useState(false);

  const institutes = [
    {
      id: 1,
      name: 'MIT University',
      icon: '🎓',
      courses: ['Computer Science 101', 'Data Structures', 'Web Development'],
    },
    {
      id: 2,
      name: 'Stanford Online',
      icon: '📚',
      courses: ['Machine Learning', 'AI Fundamentals'],
    },
  ];

  const courseData = {
    assignments: [
      { id: 1, title: 'Project Proposal', dueDate: 'Feb 20, 2026', status: 'pending', points: 100, description: 'Submit a detailed project proposal' },
      { id: 2, title: 'Midterm Essay', dueDate: 'Feb 15, 2026', status: 'submitted', points: 50, description: 'Write an essay on the course topic' },
      { id: 3, title: 'Lab Report #3', dueDate: 'Feb 10, 2026', status: 'graded', points: 25, score: 23, description: 'Document your lab findings' },
    ],
    quizzes: [
      { id: 1, title: 'Week 5 Quiz', dueDate: 'Feb 18, 2026', status: 'available', points: 20, questions: 10 },
      { id: 2, title: 'Week 4 Quiz', dueDate: 'Feb 11, 2026', status: 'completed', points: 20, score: 18, questions: 10 },
    ],
    attendance: [
      { id: 1, date: 'Feb 16, 2026', status: 'present', duration: '2h 30m' },
      { id: 2, date: 'Feb 14, 2026', status: 'present', duration: '2h 15m' },
      { id: 3, date: 'Feb 12, 2026', status: 'absent', duration: '-' },
    ],
    grades: [
      { category: 'Assignments', weight: '40%', score: 85, points: '85/100' },
      { category: 'Quizzes', weight: '30%', score: 90, points: '18/20' },
      { category: 'Midterm', weight: '15%', score: 88, points: '44/50' },
      { category: 'Final', weight: '15%', score: null, points: '-/50' },
    ],
    discussions: [
      { id: 1, title: 'Week 5: Data Structures Discussion', author: 'Prof. Smith', replies: 12, lastActivity: '2 hours ago' },
      { id: 2, title: 'Project Ideas Thread', author: 'Alice Johnson', replies: 8, lastActivity: '5 hours ago' },
      { id: 3, title: 'Study Group Formation', author: 'Bob Chen', replies: 15, lastActivity: '1 day ago' },
    ],
    resources: [
      { id: 1, name: 'Lecture Slides - Week 5.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Prof. Smith', date: 'Feb 15' },
      { id: 2, name: 'Sample Code.zip', type: 'zip', size: '1.2 MB', uploadedBy: 'Prof. Smith', date: 'Feb 14' },
      { id: 3, name: 'Reading Material.pdf', type: 'pdf', size: '5.8 MB', uploadedBy: 'Prof. Smith', date: 'Feb 10' },
    ],
    announcements: [
      { id: 1, title: 'Midterm Exam Schedule', content: 'The midterm will be held on Feb 25th', date: '2 days ago', important: true },
      { id: 2, title: 'Office Hours Update', content: 'Office hours moved to Thursdays 2-4 PM', date: '5 days ago', important: false },
      { id: 3, title: 'New Assignment Posted', content: 'Check the assignments tab for details', date: '1 week ago', important: false },
    ],
    liveClasses: [
      { id: 1, title: 'Data Structures Lecture', time: '10:00 AM - 11:30 AM', date: 'Today', instructor: 'Prof. Smith', status: 'upcoming', attendees: 45 },
      { id: 2, title: 'Lab Session - Week 5', time: '2:00 PM - 4:00 PM', date: 'Today', instructor: 'TA Johnson', status: 'upcoming', attendees: 30 },
      { id: 3, title: 'Review Session', time: '3:00 PM - 4:00 PM', date: 'Yesterday', instructor: 'Prof. Smith', status: 'completed', attendees: 50 },
    ],
    peerReviews: [
      { id: 1, assignment: 'Project Proposal', reviewer: 'Alice Johnson', status: 'pending', dueDate: 'Feb 18, 2026' },
      { id: 2, assignment: 'Midterm Essay', reviewer: 'Bob Chen', status: 'completed', score: 85, dueDate: 'Feb 15, 2026' },
    ],
    studyGroups: [
      { id: 1, name: 'Study Group Alpha', members: 8, topic: 'Data Structures', lastActivity: '2 hours ago' },
      { id: 2, name: 'Exam Prep Squad', members: 12, topic: 'Midterm Review', lastActivity: '5 hours ago' },
    ],
  };

  const calculateOverallGrade = () => {
    const totalWeight = courseData.grades.reduce((sum, g) => {
      if (g.score !== null) {
        return sum + parseFloat(g.weight);
      }
      return sum;
    }, 0);
    
    const weightedScore = courseData.grades.reduce((sum, g) => {
      if (g.score !== null) {
        return sum + (g.score * parseFloat(g.weight) / 100);
      }
      return sum;
    }, 0);
    
    return (weightedScore / totalWeight * 100).toFixed(1);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flex: 1 }}>
      {/* Institute & Course List */}
      <div
        style={{
          width: 'var(--nav-pane-width)',
          background: 'hsl(var(--bg-secondary))',
          borderRight: '1px solid hsl(var(--border-subtle))',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: 'hsl(var(--text-primary))' }}>
            Institutes
          </h2>
        </div>

        <div className="scrollable" style={{ flex: 1 }}>
          {institutes.map((institute) => (
            <div key={institute.id} style={{ marginBottom: '8px' }}>
              <div
                onClick={() => setSelectedInstitute(selectedInstitute === institute.id ? null : institute.id)}
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  background: selectedInstitute === institute.id ? 'hsl(var(--bg-tertiary))' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
                onMouseEnter={(e) => {
                  if (selectedInstitute !== institute.id) e.currentTarget.style.background = 'hsl(var(--bg-glass))';
                }}
                onMouseLeave={(e) => {
                  if (selectedInstitute !== institute.id) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ fontSize: '24px' }}>{institute.icon}</div>
                <span style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{institute.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
                  {selectedInstitute === institute.id ? '▼' : '▶'}
                </span>
              </div>

              {selectedInstitute === institute.id && (
                <div style={{ paddingLeft: '20px' }}>
                  {institute.courses.map((course, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedCourse(course)}
                      style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        background: selectedCourse === course ? 'hsl(var(--accent-secondary) / 0.2)' : 'transparent',
                        borderLeft: selectedCourse === course ? '3px solid hsl(var(--accent-secondary))' : '3px solid transparent',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCourse !== course) e.currentTarget.style.background = 'hsl(var(--bg-glass))';
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCourse !== course) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>📖 {course}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Course Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'hsl(var(--bg-primary))' }}>
        {selectedCourse ? (
          <>
            {/* Course Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid hsl(var(--border-subtle))',
                background: 'hsl(var(--bg-secondary))',
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: 'hsl(var(--text-primary))' }}>
                {selectedCourse}
              </h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['overview', 'assignments', 'quizzes', 'live-classes', 'grades', 'discussions', 'resources', 'announcements', 'study-groups'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={activeTab === tab ? '' : 'btn-ghost'}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      cursor: 'pointer',
                      background: activeTab === tab ? 'hsl(var(--accent-secondary))' : 'transparent',
                      color: activeTab === tab ? 'white' : 'hsl(var(--text-secondary))',
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'capitalize',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="scrollable gradient-mesh" style={{ flex: 1, padding: '24px' }}>
              {activeTab === 'overview' && (
                <div>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Course at a glance: assignment count, quizzes, attendance rate, and your overall grade. Click a card to jump to that section. Recent announcements are shown below.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div className="glass glass-hover" style={{ padding: '24px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                      <div style={{ fontSize: '36px', marginBottom: '8px' }}>📝</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>
                        {courseData.assignments.length}
                      </div>
                      <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))' }}>Assignments</div>
                    </div>
                    <div className="glass glass-hover" style={{ padding: '24px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                      <div style={{ fontSize: '36px', marginBottom: '8px' }}>📊</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>
                        {courseData.quizzes.length}
                      </div>
                      <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))' }}>Quizzes</div>
                    </div>
                    <div className="glass glass-hover" style={{ padding: '24px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                      <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'hsl(var(--accent-secondary))' }}>
                        {Math.round((courseData.attendance.filter((a) => a.status === 'present').length / courseData.attendance.length) * 100)}%
                      </div>
                      <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))' }}>Attendance</div>
                    </div>
                    <div className="glass glass-hover" style={{ padding: '24px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                      <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎯</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'hsl(var(--accent-primary))' }}>
                        {calculateOverallGrade()}%
                      </div>
                      <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))' }}>Overall Grade</div>
                    </div>
                  </div>

                  {/* Recent Announcements */}
                  <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>
                      Recent Announcements
                    </h3>
                    <p style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginBottom: '16px' }}>
                      Latest updates from your instructor. Important items are highlighted.
                    </p>
                    {courseData.announcements.slice(0, 2).map((announcement) => (
                      <div key={announcement.id} style={{ padding: '12px', marginBottom: '8px', borderLeft: announcement.important ? '3px solid hsl(var(--accent-warning))' : '3px solid hsl(var(--border-subtle))', background: 'hsl(var(--bg-tertiary))', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{announcement.title}</span>
                          {announcement.important && <span style={{ fontSize: '12px', color: 'hsl(var(--accent-warning))' }}>⚠️ Important</span>}
                        </div>
                        <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>{announcement.content}</div>
                        <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{announcement.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'assignments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    View and submit assignments. Each shows due date, points, and status (pending, submitted, or graded). Upload your work before the due date and check back for feedback and scores.
                  </p>
                  {courseData.assignments.map((assignment) => (
                    <div key={assignment.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '4px' }}>
                            {assignment.title}
                          </h3>
                          <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginBottom: '8px' }}>Due: {assignment.dueDate}</div>
                          <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>{assignment.description}</div>
                        </div>
                        <div
                          style={{
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            fontWeight: '600',
                            background:
                              assignment.status === 'graded'
                                ? 'hsl(var(--accent-secondary) / 0.2)'
                                : assignment.status === 'submitted'
                                ? 'hsl(var(--accent-primary) / 0.2)'
                                : 'hsl(var(--accent-warning) / 0.2)',
                            color:
                              assignment.status === 'graded'
                                ? 'hsl(var(--accent-secondary))'
                                : assignment.status === 'submitted'
                                ? 'hsl(var(--accent-primary))'
                                : 'hsl(var(--accent-warning))',
                          }}
                        >
                          {assignment.status}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>
                          Points: {assignment.score !== undefined ? `${assignment.score}/${assignment.points}` : assignment.points}
                        </div>
                        {assignment.status === 'pending' && (
                          <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => setShowSubmissionModal(true)}>
                            📤 Submit Assignment
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'live-classes' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>Live Classes</h3>
                    <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => setShowLiveClassModal(true)}>
                      📹 Join Live Class
                    </button>
                  </div>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Join scheduled lectures and lab sessions in real time. See instructor, use chat, and share your screen. Upcoming sessions show date, time, and attendee count.
                  </p>
                  {/* Live Class Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📹</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>
                        {courseData.liveClasses.filter(c => c.status === 'upcoming').length}
                      </div>
                      <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))' }}>Upcoming Classes</div>
                    </div>
                    <div className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'hsl(var(--accent-primary))' }}>
                        {courseData.liveClasses.reduce((sum, c) => sum + c.attendees, 0)}
                      </div>
                      <div style={{ fontSize: '14px', color: 'hsl(var(--text-muted))' }}>Total Attendees</div>
                    </div>
                  </div>

                  {/* Live Classes List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {courseData.liveClasses.map((classItem) => (
                      <div key={classItem.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '8px' }}>
                              {classItem.title}
                            </h4>
                            <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>
                              👤 {classItem.instructor}
                            </div>
                            <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                              📅 {classItem.date} • 🕐 {classItem.time} • 👥 {classItem.attendees} attendees
                            </div>
                          </div>
                          <div
                            style={{
                              padding: '4px 12px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: classItem.status === 'upcoming' ? 'hsl(var(--accent-primary) / 0.2)' : 'hsl(var(--bg-tertiary))',
                              color: classItem.status === 'upcoming' ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-muted))',
                            }}
                          >
                            {classItem.status}
                          </div>
                        </div>
                        {classItem.status === 'upcoming' && (
                          <button className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                            🎥 Join Class Now
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'quizzes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Take quizzes before the due date. Each shows number of questions and total points. Your score is available after submission. Start when ready — complete in one sitting.
                  </p>
                  {courseData.quizzes.map((quiz) => (
                    <div key={quiz.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '4px' }}>
                            {quiz.title}
                          </h3>
                          <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Due: {quiz.dueDate}</div>
                          <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginTop: '8px' }}>
                            {quiz.questions} questions • {quiz.points} points
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: quiz.status === 'completed' ? 'hsl(var(--accent-secondary) / 0.2)' : 'hsl(var(--accent-primary) / 0.2)',
                            color: quiz.status === 'completed' ? 'hsl(var(--accent-secondary))' : 'hsl(var(--accent-primary))',
                          }}
                        >
                          {quiz.status}
                        </div>
                      </div>
                      {quiz.score !== undefined && (
                        <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '8px' }}>
                          Score: {quiz.score}/{quiz.points}
                        </div>
                      )}
                      {quiz.status === 'available' && (
                        <button className="btn-primary" style={{ width: '100%' }}>
                          ▶️ Start Quiz
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'grades' && (
                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Your overall grade is a weighted average of assignments, quizzes, midterm, and final. N/A means that component is not yet graded. Weights show how much each category counts.
                  </p>
                  <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', fontWeight: '700', color: 'hsl(var(--accent-primary))' }}>
                      {calculateOverallGrade()}%
                    </div>
                    <div style={{ fontSize: '16px', color: 'hsl(var(--text-muted))' }}>Overall Grade</div>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>
                    Grade Breakdown
                  </h3>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginBottom: '16px' }}>
                    Score and points per category. Weight is the percentage of your final grade.
                  </p>
                  {courseData.grades.map((grade, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        marginBottom: '8px',
                        background: 'hsl(var(--bg-tertiary))',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '4px' }}>{grade.category}</div>
                        <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Weight: {grade.weight}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: grade.score !== null ? 'hsl(var(--accent-secondary))' : 'hsl(var(--text-muted))' }}>
                          {grade.score !== null ? `${grade.score}%` : 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{grade.points}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'discussions' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>Discussion Board</h3>
                    <button className="btn-primary" style={{ padding: '8px 16px' }}>
                      ➕ New Thread
                    </button>
                  </div>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Start or join discussions with your instructor and classmates. Each thread shows author, reply count, and last activity. Click to read and reply.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {courseData.discussions.map((discussion) => (
                      <div key={discussion.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '8px' }}>
                          {discussion.title}
                        </h4>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                          <span>👤 {discussion.author}</span>
                          <span>💬 {discussion.replies} replies</span>
                          <span>🕐 {discussion.lastActivity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>Course Resources</h3>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Lecture slides, readings, and other materials shared by your instructor. Download to view offline. Files show size, uploader, and date.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {courseData.resources.map((resource) => (
                      <div key={resource.id} className="glass glass-hover" style={{ padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'hsl(var(--bg-tertiary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                          }}
                        >
                          {resource.type === 'pdf' ? '📄' : '📦'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '4px' }}>{resource.name}</div>
                          <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                            {resource.size} • {resource.uploadedBy} • {resource.date}
                          </div>
                        </div>
                        <button className="btn-ghost" style={{ padding: '8px 16px' }}>
                          ⬇️ Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'study-groups' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>Study Groups</h3>
                    <button className="btn-primary" style={{ padding: '8px 16px' }}>
                      ➕ Create Study Group
                    </button>
                  </div>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Join or create groups to study with classmates. Each group has a topic and member count. Join to participate and see last activity.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {courseData.studyGroups.map((group) => (
                      <div key={group.id} className="glass glass-hover" style={{ padding: '20px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))', marginBottom: '8px' }}>
                              {group.name}
                            </h4>
                            <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>
                              📚 Topic: {group.topic}
                            </div>
                            <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
                              👥 {group.members} members • 🕐 Last activity: {group.lastActivity}
                            </div>
                          </div>
                          <button className="btn-ghost" style={{ padding: '8px 16px' }}>
                            Join
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'announcements' && (
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-primary))' }}>Course Announcements</h3>
                  <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>
                    Official updates from your instructor: exam dates, office hours, new assignments, and other course news. Important announcements are marked with a warning.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {courseData.announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="glass"
                        style={{
                          padding: '20px',
                          borderRadius: 'var(--radius-md)',
                          borderLeft: announcement.important ? '4px solid hsl(var(--accent-warning))' : '4px solid hsl(var(--border-subtle))',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{announcement.title}</h4>
                          {announcement.important && (
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'hsl(var(--accent-warning))' }}>⚠️ Important</span>
                          )}
                        </div>
                        <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '8px' }}>{announcement.content}</div>
                        <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{announcement.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Class Modal */}
            {showLiveClassModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 1000,
                }}
              >
                <div style={{ padding: '20px', borderBottom: '1px solid hsl(var(--border-subtle))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>Live Class Session</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-ghost" style={{ padding: '8px 12px' }}>💬 Chat</button>
                    <button className="btn-ghost" style={{ padding: '8px 12px' }}>👥 Participants</button>
                    <button className="btn-ghost" style={{ padding: '8px 12px' }} onClick={() => setShowLiveClassModal(false)}>✕ Leave</button>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', gap: '20px', padding: '20px' }}>
                  <div style={{ flex: 1, background: 'hsl(var(--bg-secondary))', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '64px', marginBottom: '16px' }}>📹</div>
                      <div>Video Feed - Instructor's Screen</div>
                    </div>
                  </div>
                  <div style={{ width: '300px', background: 'hsl(var(--bg-secondary))', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>Participants (45)</h4>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {['You', 'Prof. Smith', 'Alice Johnson', 'Bob Chen', 'Carol Davis'].map((name, idx) => (
                        <div key={idx} style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'hsl(var(--bg-tertiary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            👤
                          </div>
                          <span style={{ fontSize: '14px', color: 'hsl(var(--text-primary))' }}>{name}</span>
                          {name === 'Prof. Smith' && <span style={{ fontSize: '10px', color: 'hsl(var(--accent-primary))', marginLeft: 'auto' }}>Host</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px 20px', borderTop: '1px solid hsl(var(--border-subtle))', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="btn-ghost" style={{ padding: '12px 24px' }}>🎤 Mute</button>
                  <button className="btn-ghost" style={{ padding: '12px 24px' }}>📹 Stop Video</button>
                  <button className="btn-ghost" style={{ padding: '12px 24px' }}>🖥️ Share Screen</button>
                  <button className="btn-primary" style={{ padding: '12px 24px', background: 'hsl(var(--accent-warning))' }} onClick={() => setShowLiveClassModal(false)}>
                    Leave Class
                  </button>
                </div>
              </div>
            )}

            {/* Assignment Submission Modal */}
            {showSubmissionModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
                onClick={() => setShowSubmissionModal(false)}
              >
                <div
                  className="glass"
                  style={{ padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'hsl(var(--text-primary))' }}>
                    Submit Assignment
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '8px', display: 'block' }}>
                        Upload File
                      </label>
                      <input type="file" className="input-field" />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '8px', display: 'block' }}>
                        Comments (optional)
                      </label>
                      <textarea placeholder="Add any comments..." className="input-field" rows="4" />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button className="btn-primary" style={{ flex: 1 }} onClick={() => setShowSubmissionModal(false)}>
                        Submit
                      </button>
                      <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowSubmissionModal(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Peer Review Modal */}
            {showPeerReviewModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }}
                onClick={() => setShowPeerReviewModal(false)}
              >
                <div
                  className="glass"
                  style={{ padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'hsl(var(--text-primary))' }}>
                    Peer Review
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {courseData.peerReviews.map((review) => (
                      <div key={review.id} className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{review.assignment}</div>
                            <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Reviewer: {review.reviewer}</div>
                          </div>
                          <div
                            style={{
                              padding: '4px 12px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: review.status === 'completed' ? 'hsl(var(--accent-secondary) / 0.2)' : 'hsl(var(--accent-warning) / 0.2)',
                              color: review.status === 'completed' ? 'hsl(var(--accent-secondary))' : 'hsl(var(--accent-warning))',
                            }}
                          >
                            {review.status}
                          </div>
                        </div>
                        {review.score && (
                          <div style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginTop: '8px' }}>
                            Score: {review.score}/100
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>
                          Due: {review.dueDate}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="btn-ghost" style={{ width: '100%', marginTop: '16px' }} onClick={() => setShowPeerReviewModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '64px' }}>🎓</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'hsl(var(--text-secondary))' }}>
              Select an institute and course to view details
            </h3>
            <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', textAlign: 'center', maxWidth: '400px' }}>
              Access your assignments, quizzes, grades, discussions, and course resources all in one place.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstituteView;
